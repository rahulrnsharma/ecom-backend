import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage } from "mongoose";
import { CategoryDto, SearchCategoryDto } from "src/dto/category.dto";
import { IContextUser } from "src/interface/user.interface";
import { Category, CategoryDocument, CategoryModel } from "src/schema/category.schema";
import { UtilityService } from "./utility.service";
import { PaginationResponse } from "src/model/pagination.model";
import { ActiveStatusEnum } from "src/enum/common.enum";


@Injectable()
export class CategoryService {
    constructor(
        @InjectModel(CategoryModel.name) private categoryModel: Model<CategoryDocument>,
        private readonly utilityService: UtilityService
    ) { }

    async create(categoryDto: CategoryDto, contextUser: IContextUser, filename: string) {
        let _category = {
            ...categoryDto,
            slug: this.utilityService.slugify(categoryDto.name),
            createdBy: contextUser.userId,
            parentId: categoryDto?.parentId || null,
            image: filename || ""
        };
        const category = new this.categoryModel(_category);
        return category.save();
    }

    async update(id: string, categoryDto: CategoryDto, contextUser: IContextUser, filename: string) {
        let category: any = {
            ...categoryDto,
            parentId: categoryDto.parentId || null
        };
        if (filename)
            category['image'] = filename;
        const _doc: Category = await this.categoryModel.findByIdAndUpdate(id, { $set: { ...category, updatedBy: contextUser.userId } }, { runValidators: true }).exec();
        if (_doc) {
            return _doc;
        }
        else {
            throw new BadRequestException("Resource you are trying to update does not exist.");
        }
    }

    async updateHome(id: string, home: boolean, contextUser: IContextUser) {
        const _doc: Category = await this.categoryModel.findByIdAndUpdate(id, { $set: { home: home, updatedBy: contextUser.userId } }, { runValidators: true }).exec();
        if (_doc) {
            return _doc;
        }
        else {
            throw new BadRequestException("Resource you are trying to update does not exist.");
        }
    }

    async delete(id: string, contextUser: IContextUser) {
        const _doc: Category = await this.categoryModel.findByIdAndUpdate(id, { isActive: false, updatedBy: contextUser.userId }, { runValidators: true }).exec();
        if (_doc) {
            return _doc;
        }
        else {
            throw new BadRequestException("Resource you are trying to delete does not exist.");
        }
    }

    async getAll(searchDto: SearchCategoryDto): Promise<PaginationResponse<any>> {
        let _match: any = {};
        if (searchDto.parentId) {
            _match.parentId = searchDto.parentId;
        }
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
                    this.utilityService.getAddImageFieldPipeline('image', 'category', '$image'),
                    this.utilityService.getProjectPipeline({ name: 1, image: 1, description: 1, home: 1, isActive: 1 }, false)
                ],
            },
        });
        query.push(this.utilityService.getProjectPipeline({
            data: 1,
            count: { $ifNull: [{ $arrayElemAt: ["$count.total", 0] }, 0] }
        }, false))
        let _res: any[] = await this.categoryModel.aggregate(query).exec();
        return new PaginationResponse(_res[0].data, _res[0].count, searchDto.currentPage, searchDto.pageSize);
    }

    async getById(id: any): Promise<Category> {
        return this.categoryModel.findById(id).exec();
    }

    async dropdown(onlyMain: boolean) {
        let _filter: any = { isActive: true };
        if (onlyMain) {
            _filter['parentId'] = { $eq: null };
        }
        return this.categoryModel.find(_filter, { _id: 1, name: 1, image: 1 }).exec();
    }
}