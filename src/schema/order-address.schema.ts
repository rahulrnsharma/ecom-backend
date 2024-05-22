import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { AddressTypeEnum } from 'src/enum/address.enum';
import { IModel } from 'src/interface/model.interface';

export type OrderAddressDocument = HydratedDocument<OrderAddress>;

class Location {
    @Prop({ type: String, required: true })
    lat: string;
    @Prop({ type: String, required: true })
    long: string;
}

@Schema({ timestamps: true })
class OrderTrack extends Location {
}
const OrderTrackSchema = SchemaFactory.createForClass(OrderTrack);

@Schema({ timestamps: true })
export class OrderAddress {
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'orders' })
    order: ObjectId;
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
    @Prop({ type: [OrderTrackSchema], required: true, default: [] })
    track: OrderTrack[];
}

export const OrderAddressSchema = SchemaFactory.createForClass(OrderAddress);

export const OrderAddressModel: IModel = {
    schema: OrderAddressSchema,
    name: 'order-address',
};