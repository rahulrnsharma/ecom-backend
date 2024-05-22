import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { IModel } from 'src/interface/model.interface';
import { Base } from './base.schema';

export type ProductReviewDocument = HydratedDocument<ProductReview>;

@Schema({ timestamps: true })
export class ProductReview extends Base {
    @Prop({ type: String, required: true })
    comment: string;
    @Prop({ type: Number, required: true })
    rating: number;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' })
    reviewBy: ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'products' })
    product: ObjectId;
}

export const ProductReviewSchema = SchemaFactory.createForClass(ProductReview);

export const ProductReviewModel: IModel = {
    schema: ProductReviewSchema,
    name: 'product-review',
};