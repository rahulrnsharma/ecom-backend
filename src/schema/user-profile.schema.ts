import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { SexEnum } from 'src/enum/common.enum';
import { IModel } from 'src/interface/model.interface';
import { Base } from './base.schema';

export type UserProfileDocument = HydratedDocument<UserProfile>;

@Schema({ timestamps: true, toJSON: { getters: true, virtuals: true }, toObject: { getters: true, virtuals: true } })
export class UserProfile extends Base {
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, unique: true, ref: 'users' })
    user: ObjectId;
    @Prop({ type: String, default: null })
    firstName: string;
    @Prop({ type: String })
    lastName: string;
    @Prop({ type: String, default: null, get: (image: string) => `${process.env.DOC_BASE_URL}avatar/${image}` })
    image: string;
    @Prop({ type: Date, default: null })
    dob: Date;
    @Prop({ type: String, enum: Object.values(SexEnum), default: SexEnum.MALE, trim: true })
    gender: string;
    @Prop({ type: String, default: null })
    email: string;
    @Prop({ type: Number, default: 0 })
    commission: number;
    @Prop({ type: Number, default: 0 })
    wallet: number;
    @Prop({ type: String, required: true, trim: true, unique: true })
    referral: string;
    @Prop({ type: String, default: null, trim: true })
    referredBy: string;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);

export const UserProfileModel: IModel = {
    schema: UserProfileSchema,
    name: 'user-profile',
};