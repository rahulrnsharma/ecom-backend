import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { IModel } from 'src/interface/model.interface';
import { Base } from './base.schema';

export type ProductStockDocument = HydratedDocument<ProductStock>;

@Schema({ timestamps: true })
export class ProductStock extends Base {
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, unique: true, ref: 'products' })
    product: ObjectId;
    @Prop({ type: Number, required: true })
    total: number;
    @Prop({ type: Number, required: false, default: 0 })
    issue: number;
    @Prop({ type: Number, required: false, default: 0 })
    stock: number;
}

export const ProductStockSchema = SchemaFactory.createForClass(ProductStock);

export const ProductStockModel: IModel = {
    schema: ProductStockSchema,
    name: 'product-stock',
};