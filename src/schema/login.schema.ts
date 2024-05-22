import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { PlatformTypeEnum } from 'src/enum/platform.enum';
import { RoleEnum } from 'src/enum/role.enum';
import { IModel } from 'src/interface/model.interface';

export type LoginDocument = HydratedDocument<Login>;

@Schema({ timestamps: true })
export class Login {
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' })
    user: ObjectId;
    @Prop({ type: String, default: '' })
    ip: string;
    @Prop({ type: String, enum: Object.values(RoleEnum), trim: true })
    role: string;
    @Prop({ type: String, enum: Object.values(PlatformTypeEnum), trim: true, default: '' })
    platform: String;
    @Prop({ type: Boolean, default: true })
    isLoggedIn: boolean;
    @Prop({ type: Date, required: true })
    loggedIn: Date;
    @Prop({ type: Date })
    loggedOut: Date;
}

export const LoginSchema = SchemaFactory.createForClass(Login);

export const LoginModel: IModel = {
    schema: LoginSchema,
    name: 'login',
};