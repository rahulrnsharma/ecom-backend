import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage, Types } from "mongoose";
import { AdminSearchProductDto, ProductDto, SearchProductDto } from "src/dto/product.dto";
import { IContextUser } from "src/interface/user.interface";
import { PaginationResponse } from "src/model/pagination.model";
import { Product, ProductDocument, ProductModel } from "src/schema/product.schema";
import { UtilityService } from "./utility.service";
import { ActiveStatusEnum, OfferTypeEnum } from "src/enum/common.enum";
import { ReviewDto } from "src/dto/review.dto";
import { ProductReviewDocument, ProductReviewModel } from "src/schema/product-review.schema";
import { ProductStockDocument, ProductStockModel } from "src/schema/product-stock.schema";

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(ProductModel.name) private productModel: Model<ProductDocument>,
        @InjectModel(ProductStockModel.name) private productStockModel: Model<ProductStockDocument>,
        @InjectModel(ProductReviewModel.name) private productReviewModel: Model<ProductReviewDocument>,
        private readonly utilityService: UtilityService
    ) { }

    async create(productDto: ProductDto, contextUser: IContextUser) {
        let product = {
            ...productDto,
            slug: this.utilityService.slugify(productDto.title),
            createdBy: contextUser.userId
        };
        let _product = new this.productModel(product);
        // await new this.productStockModel({ product: _product._id, total: productDto.packing.quantity, stock: productDto.packing.quantity }).save();
        return _product.save();
    }
    async update(id: any, productDto: ProductDto, contextUser: IContextUser) {
        const _doc: Product = await this.productModel.findByIdAndUpdate(id, {
            $set: { ...productDto, updatedBy: contextUser.userId }
        }, { runValidators: true }).exec();
        if (_doc) {
            // if (_doc.packing.quantity != productDto.packing.quantity) {
            //     let _stock = await this.productStockModel.findOne({ product: new Types.ObjectId(id) });
            //     _stock.total = _stock.total + (productDto.packing.quantity - _doc.packing.quantity);
            //     _stock.stock = _stock.stock + (productDto.packing.quantity - _doc.packing.quantity);
            //     await _stock.save();
            // }
            return _doc;
        }
        else {
            throw new BadRequestException("Resource you are looking for not exist.");
        }
    }
    async delete(id: any, contextUser: IContextUser) {
        const _doc: Product = await this.productModel.findByIdAndUpdate(id, { isActive: false, updatedBy: contextUser.userId }, { runValidators: true }).exec();
        if (_doc) {
            return { success: true }
        }
        else {
            throw new BadRequestException("Resource you are looking for not exist.");
        }
    }
    async getAll(searchDto: AdminSearchProductDto): Promise<PaginationResponse<any>> {
        let _match: any = {};
        if (searchDto.status) {
            _match.isActive = searchDto.status == ActiveStatusEnum.ACTIVE;
        }
        if (searchDto.productStatus) {
            _match.status = searchDto.productStatus;
        }
        if (searchDto.brand) {
            _match.brand = new Types.ObjectId(searchDto.brand);
        }
        if (searchDto.category) {
            _match.category = new Types.ObjectId(searchDto.category);
        }
        if (searchDto.search) {
            _match.title = {
                $regex: new RegExp(`${searchDto.search}`, "ig"),
            }
        }
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline(_match)];
        query.push({
            $facet: {
                count: [{ $count: "total" }],
                data: [
                    this.utilityService.getSortPipeline(searchDto.orderBy, searchDto.order),
                    this.utilityService.getSkipPipeline(searchDto.currentPage, searchDto.pageSize),
                    this.utilityService.getLimitPipeline(searchDto.pageSize),
                    this.utilityService.getLookupPipeline('categories', 'category', '_id', 'category', [this.utilityService.getProjectPipeline({ name: 1 }, false)]),
                    this.utilityService.getLookupPipeline('brands', 'brand', '_id', 'brand', [this.utilityService.getProjectPipeline({ name: 1 }, false)]),
                    this.utilityService.getLookupPipeline('units', 'unit', '_id', 'unit', [this.utilityService.getProjectPipeline({ name: 1, sortName: 1 }, false)]),
                    this.utilityService.getUnwindPipeline('category'),
                    this.utilityService.getUnwindPipeline('brand'),
                    this.utilityService.getUnwindPipeline('unit'),
                    this.utilityService.getLookupPipeline('product-reviews', '_id', 'product', 'review', [this.utilityService.getGroupPipeline({ _id: "$product", total: { $sum: "$rating" }, count: { $sum: 1 } }), this.utilityService.getProjectPipeline({ count: "$count", rating: { $divide: ["$total", { $cond: { if: { $ne: ["$count", 0] }, then: "$count", else: 1 } }] } }, false)]),
                    this.utilityService.getUnwindPipeline('review'),
                    this.utilityService.getAddImageFieldPipeline('image', 'product', { $arrayElemAt: ["$gallery.image", 0] }),
                    this.utilityService.getProjectPipeline({ description: 0, summary: 0, tags: 0, tax: 0, gallery: 0, createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, __v: 0 }, false)
                ],
            },
        });
        query.push(this.utilityService.getProjectPipeline({
            data: 1,
            count: { $ifNull: [{ $arrayElemAt: ["$count.total", 0] }, 0] }
        }, false))
        let _res: any[] = await this.productModel.aggregate(query).exec();
        return new PaginationResponse(_res[0].data, _res[0].count, searchDto.currentPage, searchDto.pageSize);
    }
    async getById(id: any): Promise<Product> {
        return this.productModel.findById(id).exec();
    }
    async uploadProductImage(id: any, contextUser: IContextUser, files: any[]) {
        const _doc: Product = await this.productModel.findByIdAndUpdate(id, {
            $push: {
                gallery: {
                    $each: files
                }
            },
            updatedBy: contextUser.userId
        }, { runValidators: true }).exec();
        if (_doc) {
            return { success: true };
        }
        else {
            throw new BadRequestException("Resource you are looking for not exist.");
        }
    }
    async search(searchDto: SearchProductDto): Promise<PaginationResponse<any>> {
        let _match: any = { isActive: true, status: 'Published' };
        if (searchDto.deal) {
            _match.deal = new Types.ObjectId(searchDto.deal);
        }
        if (searchDto.brand) {
            _match.brand = new Types.ObjectId(searchDto.brand);
        }
        if (searchDto.category) {
            _match.category = new Types.ObjectId(searchDto.category);
        }
        if (searchDto.search) {
            _match.title = {
                $regex: new RegExp(`${searchDto.search}`, "ig"),
            }
        }
        let _today: Date = this.utilityService.setStartHour(new Date(), searchDto.timezone);
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline(_match)];
        query.push(this.utilityService.getLookupPipeline('categories', 'category', '_id', 'category', [this.utilityService.getMatchPipeline({ isActive: true }), this.utilityService.getProjectPipeline({ name: 1 }, false)]));
        query.push(this.utilityService.getUnwindPipeline('category'));
        query.push(this.utilityService.getMatchPipeline({ "category": { $ne: null } }));
        query.push(this.utilityService.getLookupPipeline('brands', 'brand', '_id', 'brand', [this.utilityService.getMatchPipeline({ isActive: true }), this.utilityService.getProjectPipeline({ name: 1 }, false)]));
        query.push(this.utilityService.getUnwindPipeline('brand'));
        query.push(this.utilityService.getMatchPipeline({ "brand": { $ne: null } }));
        query.push({
            $facet: {
                count: [{ $count: "total" }],
                data: [
                    this.utilityService.getSortPipeline(searchDto.orderBy, searchDto.order),
                    this.utilityService.getSkipPipeline(searchDto.currentPage, searchDto.pageSize),
                    this.utilityService.getLimitPipeline(searchDto.pageSize),
                    this.utilityService.getLookupPipeline('units', 'unit', '_id', 'unit', [this.utilityService.getProjectPipeline({ name: 1, sortName: 1 }, false)]),
                    this.utilityService.getUnwindPipeline('unit'),
                    this.utilityService.getLookupPipeline('product-reviews', '_id', 'product', 'review', [this.utilityService.getGroupPipeline({ _id: "$product", total: { $sum: "$rating" }, count: { $sum: 1 } }), this.utilityService.getProjectPipeline({ count: "$count", rating: { $divide: ["$total", { $cond: { if: { $ne: ["$count", 0] }, then: "$count", else: 1 } }] } }, false)]),
                    this.utilityService.getUnwindPipeline('review'),
                    this.utilityService.getLookupPipeline('deals', 'deal', '_id', 'deal', [this.utilityService.getMatchPipeline({ isActive: true, $and: [{ startDate: { $lte: _today } }, { endDate: { $gt: _today } }] }), this.utilityService.getProjectPipeline({ name: 1, startDate: 1, endDate: 1, type: 1, offerType: 1, offer: 1, offerMax: 1, offerBuy: 1, offerGet: 1 }, false)]),
                    this.utilityService.getUnwindPipeline('deal'),
                    this.utilityService.getAddFieldPipeline('packing.sellAfterOffer', {
                        $cond: {
                            if: { $ne: [{ $ifNull: ["$deal", null] }, null] }, then:
                                { $subtract: ["$packing.sell", { $ifNull: [{ $min: ["$deal.offerMax", { $cond: { if: { $eq: ["$deal.offerType", OfferTypeEnum.PERCENTAGE] }, then: { $divide: [{ $multiply: ["$deal.offer", "$packing.sell"] }, 100] }, else: "$deal.offer" } }] }, 0] }] }
                            , else: "$packing.sell"
                        }
                    }),
                    this.utilityService.getAddImageFieldPipeline('image', 'product', { $arrayElemAt: ["$gallery.image", 0] }),
                    this.utilityService.getProjectPipeline({ gallery: 0 }, true)
                ],
            },
        });
        query.push(this.utilityService.getProjectPipeline({
            data: 1,
            count: { $ifNull: [{ $arrayElemAt: ["$count.total", 0] }, 0] }
        }, false))
        let _res: any[] = await this.productModel.aggregate(query).exec();
        return new PaginationResponse(_res[0].data, _res[0].count, searchDto.currentPage, searchDto.pageSize);
    }
    async detail(id: any, timezone: number): Promise<any> {
        let _match: any = { _id: new Types.ObjectId(id) };
        let _today: Date = this.utilityService.setStartHour(new Date(), timezone);
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline(_match)];
        query.push(this.utilityService.getLookupPipeline('categories', 'category', '_id', 'category', [this.utilityService.getProjectPipeline({ name: 1 }, false)]));
        query.push(this.utilityService.getLookupPipeline('brands', 'brand', '_id', 'brand', [this.utilityService.getProjectPipeline({ name: 1 }, false)]));
        query.push(this.utilityService.getLookupPipeline('units', 'unit', '_id', 'unit', [this.utilityService.getProjectPipeline({ name: 1, sortName: 1 }, false)]));
        query.push(this.utilityService.getUnwindPipeline('category'));
        query.push(this.utilityService.getUnwindPipeline('brand'));
        query.push(this.utilityService.getUnwindPipeline('unit'));
        query.push(this.utilityService.getLookupPipeline('product-reviews', '_id', 'product', 'review', [this.utilityService.getGroupPipeline({ _id: "$product", total: { $sum: "$rating" }, count: { $sum: 1 } }), this.utilityService.getProjectPipeline({ count: "$count", rating: { $divide: ["$total", { $cond: { if: { $ne: ["$count", 0] }, then: "$count", else: 1 } }] } }, false)]));
        query.push(this.utilityService.getUnwindPipeline('review'));
        query.push(this.utilityService.getLookupPipeline('deals', 'deal', '_id', 'deal', [this.utilityService.getMatchPipeline({ isActive: true, $and: [{ startDate: { $lte: _today } }, { endDate: { $gt: _today } }] }), this.utilityService.getProjectPipeline({ name: 1, startDate: 1, endDate: 1, type: 1, offerType: 1, offer: 1, offerMax: 1, offerBuy: 1, offerGet: 1 }, false)]));
        query.push(this.utilityService.getUnwindPipeline('deal'));
        query.push(this.utilityService.getAddFieldPipeline('packing.sellAfterOffer', {
            $cond: {
                if: { $ne: [{ $ifNull: ["$deal", null] }, null] }, then:
                    { $subtract: ["$packing.sell", { $ifNull: [{ $min: ["$deal.offerMax", { $cond: { if: { $eq: ["$deal.offerType", OfferTypeEnum.PERCENTAGE] }, then: { $divide: [{ $multiply: ["$deal.offer", "$packing.sell"] }, 100] }, else: "$deal.offer" } }] }, 0] }] }
                , else: "$packing.sell"
            }
        }));
        query.push(this.utilityService.getAddImageFieldPipeline('image', 'product', { $arrayElemAt: ["$gallery.image", 0] }))
        query.push(this.utilityService.getProjectPipeline({ gallery: 0 }, true));
        let _res: any[] = await this.productModel.aggregate(query).exec();
        return _res[0];
    }
    async getProductImages(id: any): Promise<Product> {
        return this.productModel.findById(id, { gallery: 1 }).exec();
    }
    async autocomplete(search: string): Promise<any> {
        let _match: any = { isActive: true, status: 'Published' };
        _match.title = {
            $regex: new RegExp(`${search}`, "ig"),
        }
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline(_match)];
        query.push(this.utilityService.getLookupPipeline('categories', 'category', '_id', 'category', [this.utilityService.getMatchPipeline({ isActive: true }), this.utilityService.getProjectPipeline({ name: 1 }, false)]));
        query.push(this.utilityService.getUnwindPipeline('category'));
        query.push(this.utilityService.getMatchPipeline({ "category": { $ne: null } }));
        query.push(this.utilityService.getLookupPipeline('brands', 'brand', '_id', 'brand', [this.utilityService.getMatchPipeline({ isActive: true }), this.utilityService.getProjectPipeline({ name: 1 }, false)]));
        query.push(this.utilityService.getUnwindPipeline('brand'));
        query.push(this.utilityService.getMatchPipeline({ "brand": { $ne: null } }));
        query.push(this.utilityService.getAddImageFieldPipeline('image', 'product', { $arrayElemAt: ["$gallery.image", 0] }),)
        query.push(
            this.utilityService.getProjectPipeline({ title: 1, image: 1 }, false)
        )
        let _res: any[] = await this.productModel.aggregate(query).exec();
        return _res;
    }
    async uploadVerify(file: any) {
        return this.utilityService.readExcelFileData(file);
    }
    async review(id: any, reviewDto: ReviewDto, contextUser: IContextUser) {
        return new this.productReviewModel({ ...reviewDto, product: new Types.ObjectId(id), reviewBy: contextUser.userId }).save();
    }
    async getReview(id: any, contextUser: IContextUser) {
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline({ product: new Types.ObjectId(id) })];
        query.push(this.utilityService.getLookupPipeline('user-profiles', 'reviewBy', 'user', 'reviewBy', [this.utilityService.getAddImageFieldPipeline('image', 'avatar', '$image'), this.utilityService.getProjectPipeline({ firstName: 1, lastName: 1, image: 1 }, false)]));
        query.push(this.utilityService.getUnwindPipeline('reviewBy'));
        query.push(this.utilityService.getProjectPipeline({ comment: 1, rating: 1, reviewBy: 1, createdAt: 1 }, false));
        return await this.productReviewModel.aggregate(query).exec();
    }
    async getExcelSample() {
        return this.utilityService.getExcelProductSample();
    }
}