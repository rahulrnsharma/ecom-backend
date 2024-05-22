import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { AddressTypeEnum } from 'src/enum/address.enum';
import { IModel } from 'src/interface/model.interface';
import { Base } from './base.schema';

export type UserAddressDocument = HydratedDocument<UserAddress>;

class Location {
    @Prop({ type: String, required: true })
    lat: string;
    @Prop({ type: String, required: true })
    long: string;
}

@Schema({ timestamps: true })
export class UserAddress extends Base {
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' })
    user: ObjectId;
    @Prop({ type: String, required: true })
    street: string;
    @Prop({ type: String, enum: Object.values(AddressTypeEnum), trim: true, required: true })
    type: string;
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
}

export const UserAddressSchema = SchemaFactory.createForClass(UserAddress);

export const UserAddressModel: IModel = {
    schema: UserAddressSchema,
    name: 'user-address',
};