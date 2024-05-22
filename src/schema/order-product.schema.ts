import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { DealTypeEnum, OfferTypeEnum } from 'src/enum/common.enum';
import { IModel } from 'src/interface/model.interface';

export type OrderProductDocument = HydratedDocument<OrderProduct>;

class OrderProductPacking {
    @Prop({ type: Number, required: true })
    weight: number;
    @Prop({ type: Number, required: true })
    mrp: number;
    @Prop({ type: Number, required: true })
    sell: number;
    @Prop({ type: Number, required: true })
    sellAfterOffer: number;
    @Prop({ type: Number, required: true })
    quantity: number;
    @Prop({ type: Number, required: true })
    gst: number;
    @Prop({ type: Number, required: true })
    sgst: number;
    @Prop({ type: Number, required: true })
    cgst: number;
    @Prop({ type: Boolean, default: false })
    offerActive: boolean;
    @Prop({ type: String, required: false, enum: Object.values(OfferTypeEnum), default: OfferTypeEnum.PERCENTAGE })
    offerType: string;
    @Prop({ type: Number, required: false, default: 0 })
    offer: number;
    @Prop({ type: Number, required: false, default: 0 })
    offerMax: number;
    @Prop({ type: Number, required: false, default: 0 })
    offerBuy: number;
    @Prop({ type: Number, required: false, default: 0 })
    offerGet: number;
}
class OrderProductDeal {
    @Prop({ type: String, trim: true, required: true })
    name: string;
    @Prop({ type: Date, required: true })
    startDate: Date;
    @Prop({ type: Date, required: true })
    endDate: Date;
    @Prop({ type: String, required: true, enum: Object.values(DealTypeEnum), trim: true })
    type: string;
    @Prop({ type: String, required: true, enum: Object.values(OfferTypeEnum), trim: true })
    offerType: string;
    @Prop({ type: Number, required: true })
    offer: number;
    @Prop({ type: Number, required: true })
    offerMax: number;
    @Prop({ type: Number, required: false, default: 0 })
    offerBuy: number;
    @Prop({ type: Number, required: false, default: 0 })
    offerGet: number;
}

@Schema({ timestamps: true })
export class OrderProduct {
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'orders' })
    order: ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'products' })
    product: ObjectId;
    @Prop({ type: OrderProductPacking, required: true })
    packing: OrderProductPacking;
    @Prop({ type: OrderProductDeal, default: null })
    deal: OrderProductDeal;
}

export const OrderProductSchema = SchemaFactory.createForClass(OrderProduct);

export const OrderProductModel: IModel = {
    schema: OrderProductSchema,
    name: 'order-product',
};