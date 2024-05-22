import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IModel } from 'src/interface/model.interface';
import { Base } from './base.schema';

export type SiteConfigDocument = HydratedDocument<SiteConfig>;
class Location {
    @Prop({ type: String, required: true })
    lat: string;
    @Prop({ type: String, required: true })
    long: string;
}
@Schema({ timestamps: true, toJSON: { getters: true, virtuals: true }, toObject: { getters: true, virtuals: true } })
export class SiteConfig extends Base {
    @Prop({ type: String, required: true, trim: true })
    name: string;
    @Prop({ type: String, required: true })
    street: string;
    @Prop({ type: String, required: true })
    city: string;
    @Prop({ type: String, required: true })
    state: string;
    @Prop({ type: String, required: true })
    country: string;
    @Prop({ type: Location, required: true })
    location: Location;
    @Prop({ type: String, required: true })
    pincode: string;
    @Prop({ type: Number, required: true })
    deliveryRange: number;
    @Prop({ type: Number, required: true })
    deliveryCharge: number;
    @Prop({ type: String, required: true, default: '91' })
    countryCode: string;
    @Prop({ type: String, required: true })
    mobile: string;
    @Prop({ type: String })
    landline: string;
    @Prop({ type: Number, required: true })
    referredAmount: number;
    @Prop({ type: Number, required: true })
    refereeAmount: number;
}

export const SiteConfigSchema = SchemaFactory.createForClass(SiteConfig);

export const SiteConfigModel: IModel = {
    schema: SiteConfigSchema,
    name: 'site-config',
};