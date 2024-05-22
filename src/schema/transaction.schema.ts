import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { TransectionCategoryTypeEnum, TransectionForTypeEnum, TransectionStatusEnum, TransectionTypeEnum } from 'src/enum/transection.enum';
import { IModel } from 'src/interface/model.interface';
import { Base } from './base.schema';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ timestamps: true })
export class Transaction extends Base {
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' })
    user: ObjectId;
    @Prop({ type: Number, required: true })
    amount: number;
    @Prop({ type: String, enum: Object.values(TransectionCategoryTypeEnum), trim: true, required: true })
    category: string;
    @Prop({ type: String, enum: Object.values(TransectionTypeEnum), trim: true, required: true })
    type: string;
    @Prop({ type: mongoose.Schema.Types.ObjectId, default: null })
    transectionId: ObjectId;
    @Prop({ type: String, default: null })
    paymentId: string;
    @Prop({ type: String, enum: Object.values(TransectionForTypeEnum), required: true, trim: true })
    for: string;
    @Prop({ type: String, enum: Object.values(TransectionStatusEnum), required: true, trim: true, default: TransectionStatusEnum.INITIATED })
    status: string;
    @Prop({ type: Object, trim: true, default: null })
    data: Object;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

export const TransactionModel: IModel = {
    schema: TransactionSchema,
    name: 'transaction',
};