import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { IModel } from 'src/interface/model.interface';
import { Base } from './base.schema';

export type UserReviewDocument = HydratedDocument<UserReview>;

@Schema({ timestamps: true })
export class UserReview extends Base {
    @Prop({ type: String, required: true })
    comment: string;
    @Prop({ type: Number, required: true })
    rating: number;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' })
    user: ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' })
    reviewBy: ObjectId;
}

export const UserReviewSchema = SchemaFactory.createForClass(UserReview);

export const UserReviewModel: IModel = {
    schema: UserReviewSchema,
    name: 'user-review',
};