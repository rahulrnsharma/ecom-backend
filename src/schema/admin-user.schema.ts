import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { RoleEnum } from 'src/enum/role.enum';
import { IModel } from 'src/interface/model.interface';
import { Base } from './base.schema';

export type AdminUserDocument = HydratedDocument<AdminUser>;

@Schema({ timestamps: true })
export class AdminUser extends Base {
    @Prop({ type: String, required: true })
    firstName: string;
    @Prop({ type: String })
    lastName: string;
    @Prop({ type: String, required: true, index: true, unique: true, sparse: true })
    userName: string;
    @Prop({ type: String, select: false })
    password: string;
    @Prop({ type: String, enum: [RoleEnum.ADMIN, RoleEnum.DATAMANAGEMENT], trim: true })
    role: string;
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);

export const AdminUserModel: IModel = {
    schema: AdminUserSchema,
    name: 'admin-user',
};