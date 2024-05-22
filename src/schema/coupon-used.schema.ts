import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { IModel } from 'src/interface/model.interface';
import { Base } from './base.schema';

export type CouponUsedDocument = HydratedDocument<CouponUsed>;

@Schema({ timestamps: true, toJSON: { getters: true, virtuals: true }, toObject: { getters: true, virtuals: true } })
export class CouponUsed extends Base {
    @Prop({ type: String, required: true })
    code: string;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' })
    user: ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'orders' })
    order: ObjectId;
}

export const CouponUsedSchema = SchemaFactory.createForClass(CouponUsed);

export const CouponUsedModel: IModel = {
    schema: CouponUsedSchema,
    name: 'coupon-used',
};