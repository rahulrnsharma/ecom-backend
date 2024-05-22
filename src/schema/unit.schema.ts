import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IModel } from 'src/interface/model.interface';
import { Base } from './base.schema';

export type UnitDocument = HydratedDocument<Unit>;

@Schema({ timestamps: true })
export class Unit extends Base {
    @Prop({ type: String, required: true, trim: true, unique: true })
    name: string;
    @Prop({ type: String, required: true, trim: true, lowercase: true, unique: true })
    sortName: string;
}

export const UnitSchema = SchemaFactory.createForClass(Unit);

export const UnitModel: IModel = {
    schema: UnitSchema,
    name: 'unit',
};