import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { OfferTypeEnum } from 'src/enum/common.enum';
import { CouponUsedTypeEnum } from 'src/enum/coupon.enum';
import { IModel } from 'src/interface/model.interface';
import { Base } from './base.schema';

export type CouponDocument = HydratedDocument<Coupon>;

@Schema({ timestamps: true, toJSON: { getters: true, virtuals: true }, toObject: { getters: true, virtuals: true } })
export class Coupon extends Base {
    @Prop({ type: String, trim: true, required: true, unique: true })
    code: string;
    @Prop({ type: String, trim: true, required: true })
    description: string;
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

export const CouponSchema = SchemaFactory.createForClass(Coupon);

export const CouponModel: IModel = {
    schema: CouponSchema,
    name: 'coupon',
};