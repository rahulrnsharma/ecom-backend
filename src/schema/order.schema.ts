import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId, Types } from 'mongoose';
import { OrderPaymentOptionEnum, OrderStatusEnum } from 'src/enum/order.enum';
import { IModel } from 'src/interface/model.interface';
import { Base } from './base.schema';
import { CouponUsedTypeEnum } from 'src/enum/coupon.enum';
import { OfferTypeEnum } from 'src/enum/common.enum';

export type OrderDocument = HydratedDocument<Order>;
@Schema({ timestamps: true })
class OrderTimeline {
    @Prop({ type: String, enum: Object.values(OrderStatusEnum), trim: true, required: true })
    status: string;
    @Prop({ type: String, required: true })
    summary: string;
    @Prop({ type: String, required: false, default: null })
    remark: string;
}
const OrderTimelineSchema = SchemaFactory.createForClass(OrderTimeline);
class OrderCoupon {
    @Prop({ type: String, trim: true, required: true })
    code: string;
    @Prop({ type: String, required: true, enum: Object.values(CouponUsedTypeEnum), trim: true })
    use: string;
    @Prop({ type: String, required: true, enum: Object.values(OfferTypeEnum), trim: true })
    type: string;
    @Prop({ type: Number, required: true })
    value: number;
    @Prop({ type: Number, required: true })
    max: number;
    @Prop({ type: Number, required: true })
    require: number;
}
@Schema({ timestamps: true })
export class Order extends Base {
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' })
    user: ObjectId;
    @Prop({ type: String, required: true, trim: true, unique: true })
    number: string;
    @Prop({ type: String, enum: Object.values(OrderStatusEnum), trim: true, required: true })
    status: string;
    @Prop({ type: String, enum: Object.values(OrderPaymentOptionEnum), trim: true, required: true })
    paymentType: string;
    @Prop({ type: Boolean, required: true, default: false })
    isCouponApply: boolean;
    @Prop({ type: OrderCoupon, required: false, default: null })
    coupon: OrderCoupon;
    @Prop({ type: Number, required: false, default: 0 })
    couponAmount: number;
    @Prop({ type: Number, required: false, default: 0 })
    wallet: number;
    @Prop({ type: Number, required: true })
    mrp: number;
    @Prop({ type: Number, required: true })
    sell: number;
    @Prop({ type: Number, required: true })
    amount: number;
    @Prop({ type: Number, required: true })
    gst: number;
    @Prop({ type: Number, required: true })
    sgst: number;
    @Prop({ type: Number, required: true })
    cgst: number;
    @Prop({ type: Number, required: true, default: 0 })
    charge: number;
    @Prop({ type: Number, required: true, default: 0 })
    assigneeFee: number;
    @Prop({ type: Number, required: true })
    pay: number;//total paid by user
    @Prop({ type: String, required: false, default: null })
    reason: string;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, default: null, ref: 'users' })
    assign: ObjectId;
    @Prop({ type: [OrderTimelineSchema], required: false, default: [] })
    timeline: OrderTimeline[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);

export const OrderModel: IModel = {
    schema: OrderSchema,
    name: 'order',
};