import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { IModel } from 'src/interface/model.interface';
import { Base } from './base.schema';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true, toJSON: { getters: true, virtuals: true }, toObject: { getters: true, virtuals: true } })
export class Category extends Base {
    @Prop({ type: String, required: true, unique: true })
    name: string;
    @Prop({ type: String, required: true, unique: true })
    slug: string;
    @Prop({ type: String })
    description: string;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, default: null, ref: 'categories' })
    parentId: ObjectId;
    @Prop({ type: String, default: null, get: (image: string) => `${process.env.DOC_BASE_URL}category/${image}` })
    image: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

export const CategoryModel: IModel = {
    schema: CategorySchema,
    name: 'category',
};