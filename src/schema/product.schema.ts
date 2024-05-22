import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { OfferTypeEnum } from 'src/enum/common.enum';
import { ProductStatusEnum } from 'src/enum/product.enum';
import { IModel } from 'src/interface/model.interface';
import { Base } from './base.schema';

export type ProductDocument = HydratedDocument<Product>;

class ProductPacking {
    @Prop({ type: Number, required: true, unique: true })
    weight: number;
    @Prop({ type: Number, required: true })
    mrp: number;
    @Prop({ type: Number, required: true })
    sell: number;
    @Prop({ type: Number, required: true })
    quantity: number;
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
@Schema({ toJSON: { getters: true, virtuals: true }, toObject: { getters: true, virtuals: true } })
class Gallery {
    @Prop({ type: String, default: null, get: (image: string) => `${process.env.DOC_BASE_URL}product/${image}` })
    image: string;
}
const GallerySchema = SchemaFactory.createForClass(Gallery);

@Schema({ timestamps: true, toJSON: { getters: true, virtuals: true }, toObject: { getters: true, virtuals: true } })
export class Product extends Base {
    @Prop({ type: String, required: true, trim: true, unique: true })
    title: string;
    @Prop({ type: String, required: true, trim: true, lowercase: true, unique: true })
    slug: string;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'categories' })
    category: ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'brands' })
    brand: ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'units' })
    unit: ObjectId;
    @Prop({ type: String, required: true, unique: true })
    sku: string;
    @Prop({ type: String, required: false, default: null })
    shop: string;
    @Prop({ type: String, required: true })
    summary: string;
    @Prop({ type: String, required: true })
    description: string;
    @Prop({ type: String, enum: Object.values(ProductStatusEnum), trim: true, default: 'Draft' })
    status: string;
    @Prop({ type: ProductPacking, required: true })
    packing: ProductPacking;
    @Prop({ type: [GallerySchema], required: false, default: [] })
    gallery: Gallery[];
    @Prop({ type: [String] })
    tags: string[];
    @Prop({ type: mongoose.Schema.Types.ObjectId, default: null, ref: 'deals' })
    deal: ObjectId;
    @Prop({ type: Number, required: true, default: 0 })
    gst: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

export const ProductModel: IModel = {
    schema: ProductSchema,
    name: 'product',
};