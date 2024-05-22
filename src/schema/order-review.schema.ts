import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { IModel } from 'src/interface/model.interface';
import { Base } from './base.schema';

export type OrderReviewDocument = HydratedDocument<OrderReview>;

@Schema({ timestamps: true })
export class OrderReview extends Base {
    @Prop({ type: String, required: true })
    comment: string;
    @Prop({ type: Number, required: true })
    rating: number;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' })
    reviewBy: ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'orders' })
    order: ObjectId;
}

export const OrderReviewSchema = SchemaFactory.createForClass(OrderReview);

export const OrderReviewModel: IModel = {
    schema: OrderReviewSchema,
    name: 'order-review',
};