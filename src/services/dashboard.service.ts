import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage } from "mongoose";
import { InquiryModel, InquiryDocument } from "src/schema/inquiry.schema";
import { OrderModel, OrderDocument } from "src/schema/order.schema";
import { UserDocument, UserModel } from "src/schema/user.schema";
import { UtilityService } from "./utility.service";
import { ProductDocument, ProductModel } from "src/schema/product.schema";

@Injectable()
export class DashboardService {
    constructor(@InjectModel(OrderModel.name) private orderModel: Model<OrderDocument>,
        @InjectModel(UserModel.name) private userModel: Model<UserDocument>,
        @InjectModel(InquiryModel.name) private inquiryModel: Model<InquiryDocument>,
        @InjectModel(ProductModel.name) private productModel: Model<ProductDocument>,
        private utilityService: UtilityService) { }

    async getDashboardData(): Promise<any> {
        let _res: any[] = await Promise.all([
            this.getCountByOrderStatus(),
            this.getCountByUserRole(),
            this.getCountByInquiryStatus(),
            this.getCountByProductStatus()
        ])
        return {
            order: _res[0], user: _res[1], inquiry: _res[2], product: _res[3]
        };
    }
    async getUserDashboard(): Promise<any> {
        return this.getCountByUserRole();
    }
    async getOrderDashboard(): Promise<any> {
        return this.getCountByOrderStatus();
    }
    async getInquiryDashboard(): Promise<any> {
        return this.getCountByInquiryStatus();
    }
    async getProductDashboard(): Promise<any> {
        return this.getCountByProductStatus();
    }
    async getCountByOrderStatus(): Promise<any> {
        let _match: any = {};
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline(_match)];
        query.push(this.utilityService.getGroupPipeline({
            _id: "$status", total: { $sum: 1 }
        }));
        query.push(this.utilityService.getProjectPipeline({ status: "$_id", _id: 0, total: 1 }, false));
        query.push(this.utilityService.getGroupPipeline({ _id: null, array: { $push: { k: "$status", v: "$total" } } }))
        query.push({ $replaceRoot: { newRoot: { $arrayToObject: "$array" } } });
        let _res: any[] = await this.orderModel.aggregate(query);
        return this.utilityService.orderStatusCount(_res[0] || {});
    }
    async getCountByUserRole(): Promise<any> {
        let _match: any = {};
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline(_match)];

        query.push(this.utilityService.getGroupPipeline({
            _id: "$role", total: { $sum: 1 }
        }));
        query.push(this.utilityService.getProjectPipeline({ role: "$_id", _id: 0, total: 1 }, false));
        query.push(this.utilityService.getGroupPipeline({ _id: null, array: { $push: { k: "$role", v: "$total" } } }))
        query.push({ $replaceRoot: { newRoot: { $arrayToObject: "$array" } } });
        let _res: any[] = await this.userModel.aggregate(query);
        return this.utilityService.userCount(_res[0] || {});
    }
    async getCountByInquiryStatus(): Promise<any> {
        let _match: any = {};
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline(_match)];

        query.push(this.utilityService.getGroupPipeline({
            _id: "$status", total: { $sum: 1 }
        }));
        query.push(this.utilityService.getProjectPipeline({ status: "$_id", _id: 0, total: 1 }, false));
        query.push(this.utilityService.getGroupPipeline({ _id: null, array: { $push: { k: "$status", v: "$total" } } }))
        query.push({ $replaceRoot: { newRoot: { $arrayToObject: "$array" } } });
        let _res: any[] = await this.inquiryModel.aggregate(query);
        return this.utilityService.inquiryStatusCount(_res[0] || {});
    }
    async getCountByProductStatus(): Promise<any> {
        let _match: any = {};
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline(_match)];

        query.push(this.utilityService.getGroupPipeline({
            _id: "$status", total: { $sum: 1 }
        }));
        query.push(this.utilityService.getProjectPipeline({ status: "$_id", _id: 0, total: 1 }, false));
        query.push(this.utilityService.getGroupPipeline({ _id: null, array: { $push: { k: "$status", v: "$total" } } }))
        query.push({ $replaceRoot: { newRoot: { $arrayToObject: "$array" } } });
        let _res: any[] = await this.productModel.aggregate(query);
        return this.utilityService.productStatusCount(_res[0] || {});
    }
}