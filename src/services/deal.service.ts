import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage, Types } from "mongoose";
import { DealDto, DealProductDto, SearchDealDto } from "src/dto/deal.dto";
import { IContextUser } from "src/interface/user.interface";
import { Deal, DealDocument, DealModel } from "src/schema/deal.schema";
import { ProductDocument, ProductModel } from "src/schema/product.schema";
import { UtilityService } from "./utility.service";
import { DealForEnum } from "src/enum/common.enum";

@Injectable()
export class DealService {
    constructor(@InjectModel(DealModel.name) private dealModel: Model<DealDocument>,
        @InjectModel(ProductModel.name) private productModel: Model<ProductDocument>,
        private utilityService: UtilityService) { }

    async create(dealDto: DealDto, contextUser: IContextUser): Promise<Deal> {
        let _dealDto: any = { ...dealDto, startDate: this.utilityService.setStartHour(dealDto.startDate, dealDto.timezone), endDate: this.utilityService.setEndHour(dealDto.endDate, dealDto.timezone) };
        const deal = new this.dealModel({ ..._dealDto, createdBy: contextUser.userId });
        return deal.save();
    }
    async update(id: any, dealDto: DealDto, contextUser: IContextUser): Promise<Deal> {
        let _dealDto: any = { ...dealDto, startDate: this.utilityService.setStartHour(dealDto.startDate, dealDto.timezone), endDate: this.utilityService.setEndHour(dealDto.endDate, dealDto.timezone) };
        const _doc: Deal = await this.dealModel.findByIdAndUpdate(id, { $set: { ..._dealDto, updatedBy: contextUser.userId } }, { runValidators: true }).exec();
        if (_doc) {
            return _doc
        }
        else {
            throw new BadRequestException("Resource you are trying to update does not exist.");
        }
    }
    async delete(id: any, contextUser: IContextUser) {
        const _doc: Deal = await this.dealModel.findByIdAndDelete(id).exec();
        if (_doc) {
            this.productModel.findByIdAndUpdate({ deal: new Types.ObjectId(id) }, { $set: { deal: null } }).exec();
            return { success: true };
        }
        else {
            throw new BadRequestException("Resource you are trying to delete does not exist.");
        }
    }
    async getAll(): Promise<Deal[]> {
        return this.dealModel.find({ isActive: true }).exec();
    }
    async getById(id: any): Promise<Deal> {
        return this.dealModel.findById(id).exec();
    }
    async getDealProductById(id: any) {
        let _match: any = { deal: new Types.ObjectId(id) };
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline(_match)];
        query.push(this.utilityService.getLookupPipeline('categories', 'category', '_id', 'category', [this.utilityService.getProjectPipeline({ name: 1 }, false)]));
        query.push(this.utilityService.getLookupPipeline('brands', 'brand', '_id', 'brand', [this.utilityService.getProjectPipeline({ name: 1 }, false)]));
        query.push(this.utilityService.getLookupPipeline('units', 'unit', '_id', 'unit', [this.utilityService.getProjectPipeline({ name: 1, sortName: 1 }, false)]));
        query.push(this.utilityService.getUnwindPipeline('category'));
        query.push(this.utilityService.getUnwindPipeline('brand'));
        query.push(this.utilityService.getUnwindPipeline('unit'));
        query.push(this.utilityService.getAddImageFieldPipeline('image', 'product', { $arrayElemAt: ["$gallery.image", 0] }));
        query.push(this.utilityService.getProjectPipeline({ description: 0, summary: 0, tags: 0, tax: 0, gallery: 0, createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, __v: 0 }, false));
        return this.productModel.aggregate(query).exec();
    }
    async addProductToDeal(id: any, dealProductDto: DealProductDto) {
        let _ids: Types.ObjectId[] = dealProductDto.products.map((id) => new Types.ObjectId(id));
        this.productModel.updateMany({ _id: { $in: _ids } }, { $set: { deal: new Types.ObjectId(id) } }).exec();
        return { success: true };
    }
    async removeProductFromDeal(id: any, dealProductDto: DealProductDto) {
        let _ids: Types.ObjectId[] = dealProductDto.products.map((id) => new Types.ObjectId(id));
        this.productModel.updateMany({ _id: { $in: _ids }, deal: new Types.ObjectId(id) }, { $set: { deal: null } }).exec();
        return { success: true };
    }
    async getByType(searchDto: SearchDealDto) {
        if (searchDto.type == DealForEnum.CURRENT) {
            let _today: Date = this.utilityService.setStartHour(new Date(), searchDto.timezone);
            return this.dealModel.find({ isActive: true, $and: [{ startDate: { $lte: _today } }, { endDate: { $gt: _today } }] }).exec();
        }
        else {
            let _today: Date = this.utilityService.setEndHour(new Date(), searchDto.timezone);
            return this.dealModel.find({ isActive: true, startDate: { $gt: _today } }).exec();
        }
    }
}