import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage } from "mongoose";
import { BrandDto, SearchBrandDto } from "src/dto/brand.dto";
import { IContextUser } from "src/interface/user.interface";
import { Brand, BrandDocument, BrandModel } from "src/schema/brand.schema";
import { UtilityService } from "./utility.service";
import { ActiveStatusEnum } from "src/enum/common.enum";
import { PaginationResponse } from "src/model/pagination.model";


@Injectable()
export class BrandService {
    constructor(
        @InjectModel(BrandModel.name) private brandModel: Model<BrandDocument>,
        private readonly utilityService: UtilityService
    ) { }

    async create(brandDto: BrandDto, contextUser: IContextUser, filename: string) {
        let _brand = {
            ...brandDto,
            slug: this.utilityService.slugify(brandDto.name),
            createdBy: contextUser.userId,
            image: filename || ""
        };
        const brand = new this.brandModel(_brand);
        return brand.save();
    }

    async update(id: string, brandDto: BrandDto, contextUser: IContextUser, filename: string) {
        let brand: any = {
            ...brandDto,
        };
        if (filename)
            brand['image'] = filename;
        const _doc: Brand = await this.brandModel.findByIdAndUpdate(id, { $set: { ...brand, updatedBy: contextUser.userId } }, { new: true, runValidators: true }).exec();
        if (_doc) {
            return _doc;
        }
        else {
            throw new BadRequestException("Resource you are looking for not exist.");
        }
    }

    async delete(id: string, contextUser: IContextUser) {
        const _doc: Brand = await this.brandModel.findByIdAndUpdate(id, { isActive: false, updatedBy: contextUser.userId }, { runValidators: true }).exec();
        if (_doc) {
            return _doc;
        }
        else {
            throw new BadRequestException("Resource you are looking for not exist.");
        }
    }
    async getAll(searchDto: SearchBrandDto): Promise<PaginationResponse<any>> {
        let _match: any = {};
        if (searchDto.status) {
            _match.isActive = searchDto.status == ActiveStatusEnum.ACTIVE;
        }
        if (searchDto.name) {
            _match.name = {
                $regex: new RegExp(`${searchDto.name}`, "ig"),
            }
        }
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline(_match)];
        query.push({
            $facet: {
                count: [{ $count: "total" }],
                data: [
                    this.utilityService.getSortPipeline('createdAt', 'desc'),
                    this.utilityService.getSkipPipeline(searchDto.currentPage, searchDto.pageSize),
                    this.utilityService.getLimitPipeline(searchDto.pageSize),
                    this.utilityService.getAddImageFieldPipeline('image', 'brand', '$image'),
                    this.utilityService.getProjectPipeline({ name: 1, image: 1, isActive: 1 }, false)
                ],
            },
        });
        query.push(this.utilityService.getProjectPipeline({
            data: 1,
            count: { $ifNull: [{ $arrayElemAt: ["$count.total", 0] }, 0] }
        }, false))
        let _res: any[] = await this.brandModel.aggregate(query).exec();
        return new PaginationResponse(_res[0].data, _res[0].count, searchDto.currentPage, searchDto.pageSize);
    }
    async getById(id: any): Promise<Brand> {
        return this.brandModel.findById(id).exec();
    }

    async dropdown() {
        return this.brandModel.find({ isActive: true }, { _id: 1, name: 1, image: 1 }).exec();
    }
}