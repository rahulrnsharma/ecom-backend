import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { RoleEnum } from 'src/enum/role.enum';
import { IModel } from 'src/interface/model.interface';
import { Base } from './base.schema';

export type UserDocument = HydratedDocument<User>;

class Device {
    @Prop({ type: String, default: '' })
    deviceId: string;
    @Prop({ type: String, default: '' })
    deviceName: string;
    @Prop({ type: String, default: '' })
    deviceToken: string;
}

@Schema({ timestamps: true })
export class User extends Base {
    @Prop({ type: String, required: true, default: '91' })
    countryCode: string;
    @Prop({ type: String, required: true, index: true, unique: true, sparse: true })
    mobile: string;
    @Prop({ type: String, enum: [RoleEnum.USER, RoleEnum.DELIVERY], trim: true, default: RoleEnum.USER })
    role: string;
    @Prop({ type: String, select: false })
    password: string;
    @Prop({ type: Boolean, default: false })
    isPassword: boolean;
    @Prop({ type: Device })
    device: Device;
}
export const UserSchema = SchemaFactory.createForClass(User);
export const UserModel: IModel = {
    schema: UserSchema,
    name: 'user',
};