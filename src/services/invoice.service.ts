import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IContextUser } from "src/interface/user.interface";
import { OrderDocument, OrderModel } from "src/schema/order.schema";


@Injectable()
export class InvoiceService {
    constructor(@InjectModel(OrderModel.name) private orderModel: Model<OrderDocument>) { }

}