import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IModel } from 'src/interface/model.interface';
import { Base } from './base.schema';
import { DealTypeEnum, OfferTypeEnum } from 'src/enum/common.enum';

export type DealDocument = HydratedDocument<Deal>;

@Schema({ timestamps: true, toJSON: { getters: true, virtuals: true }, toObject: { getters: true, virtuals: true } })
export class Deal extends Base {
    @Prop({ type: String, trim: true, required: true })
    name: string;
    @Prop({ type: Date, required: true })
    startDate: Date;
    @Prop({ type: Date, required: true })
    endDate: Date;
    @Prop({ type: String, required: true, enum: Object.values(DealTypeEnum), trim: true })
    type: string;
    @Prop({ type: String, required: true, enum: Object.values(OfferTypeEnum), trim: true })
    offerType: string;
    @Prop({ type: Number, required: true })
    offer: number;
    @Prop({ type: Number, required: true })
    offerMax: number;
    @Prop({ type: Number, required: false, default: 0 })
    offerBuy: number;
    @Prop({ type: Number, required: false, default: 0 })
    offerGet: number;
}

export const DealSchema = SchemaFactory.createForClass(Deal);

export const DealModel: IModel = {
    schema: DealSchema,
    name: 'deal',
};