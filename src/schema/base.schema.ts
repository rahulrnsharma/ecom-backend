import { Prop } from "@nestjs/mongoose";
import mongoose, { ObjectId } from "mongoose";

export class Base {
    @Prop({ type: mongoose.Schema.Types.ObjectId, select: false })
    createdBy: ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId, select: false })
    updatedBy: ObjectId;
    @Prop({ type: Date, select: false })
    createdAt: Date;
    @Prop({ type: Date, select: false })
    updatedAt: Date;
    @Prop({ type: Boolean, default: true })
    isActive: boolean;
}