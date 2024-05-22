import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { IModel } from 'src/interface/model.interface';
import { Base } from './base.schema';

export type UserCartDocument = HydratedDocument<UserCart>;
@Schema()
class CartProduct {
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'products' })
    product: ObjectId;
    @Prop({ type: Number, required: true })
    quantity: number;
}
const CartProductSchema = SchemaFactory.createForClass(CartProduct);
@Schema({ timestamps: true })
export class UserCart extends Base {
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' })
    user: ObjectId;
    @Prop({ type: [CartProductSchema], required: true })
    products: CartProduct[];
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'coupons', default: null })
    coupon: ObjectId;
}

export const UserCartSchema = SchemaFactory.createForClass(UserCart);

export const UserCartModel: IModel = {
    schema: UserCartSchema,
    name: 'user-cart',
};