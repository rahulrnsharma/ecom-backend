import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BannerTypeEnum } from 'src/enum/banner-type.enum';
import { IModel } from 'src/interface/model.interface';
import { Base } from './base.schema';

export type BannerDocument = HydratedDocument<Banner>;

@Schema({ timestamps: true, toJSON: { getters: true, virtuals: true }, toObject: { getters: true, virtuals: true } })
export class Banner extends Base {
    @Prop({ type: String, trim: true,required: false})
    heading: string;
    @Prop({ type: String, trim: true,required: false})
    text: string;
    @Prop({ type: String, required: true, enum: Object.values(BannerTypeEnum), trim: true})
    type: string;
    @Prop({ type: String, required: false, trim: true, default: null})
    url: string;
    @Prop({ type: String, required:true, get: (image: string) => `${process.env.DOC_BASE_URL}banner/${image}`})
    image: string;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);

export const BannerModel: IModel = {
    schema: BannerSchema,
    name: 'banner',
};