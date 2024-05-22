import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IModel } from 'src/interface/model.interface';
import { Base } from './base.schema';

export type BrandDocument = HydratedDocument<Brand>;

@Schema({ timestamps: true, toJSON: { getters: true, virtuals: true }, toObject: { getters: true, virtuals: true } })
export class Brand extends Base {
    @Prop({ type: String, required: true, trim: true, unique: true })
    name: string;
    @Prop({ type: String, required: true, trim: true, lowercase: true, unique: true })
    slug: string;
    @Prop({ type: String, default: null, get: (image: string) => `${process.env.DOC_BASE_URL}brand/${image}` })
    image: string;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);

export const BrandModel: IModel = {
    schema: BrandSchema,
    name: 'brand',
};