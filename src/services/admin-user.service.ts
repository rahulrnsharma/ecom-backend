import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId, PipelineStage, Types } from "mongoose";
import { AdminLoginDto, AdminUserCreateDto } from "src/dto/login.dto";
import { SearchAdminUserDto } from "src/dto/user.dto";
import { SortOrderEnum } from "src/enum/common.enum";
import { RoleEnum } from "src/enum/role.enum";
import { IContextUser } from "src/interface/user.interface";
import { PaginationResponse } from "src/model/pagination.model";
import { AdminUser, AdminUserDocument, AdminUserModel } from "src/schema/admin-user.schema";
import { UtilityService } from "./utility.service";


@Injectable()
export class AdminUserService {
    constructor(@InjectModel(AdminUserModel.name) private adminUserModel: Model<AdminUserDocument>, private utilityService: UtilityService) { }

    async createAdminUser(adminUserCreateDto: AdminUserCreateDto): Promise<AdminUser> {
        adminUserCreateDto.password = await this.utilityService.hashPassword(adminUserCreateDto.password);
        return new this.adminUserModel({ ...adminUserCreateDto, role: RoleEnum.ADMIN }).save();
    }

    async findAll(searchDto: SearchAdminUserDto): Promise<PaginationResponse<any>> {
        let _match: any = {};
        if (searchDto.role) {
            _match.role = searchDto.role;
        }
        else {
            _match.role = { $nin: [RoleEnum.ADMIN] };
        }
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline(_match)];
        query.push({
            $facet: {
                count: [{ $count: "total" }],
                data: [
                    this.utilityService.getSortPipeline('createdAt', SortOrderEnum.DESC),
                    this.utilityService.getSkipPipeline(searchDto.currentPage, searchDto.pageSize),
                    this.utilityService.getProjectPipeline({ firstName: 1, lastName: 1, role: 1, userName: 1, createdAt: 1, isActive: 1 }, false)
                ]
            }
        });
        query.push(this.utilityService.getProjectPipeline({
            data: 1,
            count: { $ifNull: [{ $arrayElemAt: ["$count.total", 0] }, 0] }
        }, false))
        let _res: any[] = await this.adminUserModel.aggregate(query).exec();
        return new PaginationResponse(_res[0].data, _res[0].count, searchDto.currentPage, searchDto.pageSize);
    }

    async getDetailById(id: any): Promise<any> {
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline({ _id: new Types.ObjectId(id) })];
        query.push(this.utilityService.getProjectPipeline({ firstName: 1, lastName: 1, role: 1, userName: 1, createdAt: 1, isActive: 1 }, false));
        let _res: any[] = await this.adminUserModel.aggregate(query).exec();
        return _res[0];
    }

    async findByUserNameAndPassword(loginDto: AdminLoginDto) {
        let adminUser: AdminUser = await this.adminUserModel.findOne({ userName: loginDto.username }).select("+password");
        if (adminUser) {
            const isMatch = await this.utilityService.comparePassword(loginDto.password, adminUser.password);
            if (!isMatch) {
                throw new BadRequestException("Invalid Credentials.");
            }
            return adminUser;
        }
        throw new BadRequestException("Invalid Credentials.");
    }
    async findById(id: ObjectId): Promise<AdminUser> {
        return this.adminUserModel.findById(id).exec();
    }
    async createDataManagementUser(adminUserCreateDto: AdminUserCreateDto, contextUser: IContextUser): Promise<AdminUser> {
        adminUserCreateDto.password = await this.utilityService.hashPassword(adminUserCreateDto.password);
        return new this.adminUserModel({ ...adminUserCreateDto, createdBy: contextUser.userId, role: RoleEnum.DATAMANAGEMENT }).save();
    }
}