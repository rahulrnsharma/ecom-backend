import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CouponDto } from "src/dto/coupon.dto";
import { IContextUser } from "src/interface/user.interface";
import { Coupon, CouponDocument, CouponModel } from "src/schema/coupon.schema";

@Injectable()
export class CouponService {
    constructor(@InjectModel(CouponModel.name) private couponModel: Model<CouponDocument>) { }

    async create(couponDto: CouponDto, contextUser: IContextUser): Promise<Coupon> {
        const coupon = new this.couponModel({ ...couponDto, createdBy: contextUser.userId });
        return coupon.save();
    }
    async update(id: any, couponDto: CouponDto, contextUser: IContextUser): Promise<Coupon> {
        const _doc: Coupon = await this.couponModel.findByIdAndUpdate(id, { $set: { ...couponDto, updatedBy: contextUser.userId } }, { runValidators: true }).exec();
        if (_doc) {
            return _doc
        }
        else {
            throw new BadRequestException("Resource you are update does not exist.");
        }
    }
    async delete(id: any, contextUser: IContextUser) {
        const _doc: Coupon = await this.couponModel.findByIdAndUpdate(id, { isActive: false, updatedBy: contextUser.userId }, { runValidators: true }).exec();
        if (_doc) {
            return { success: true };
        }
        else {
            throw new BadRequestException("Resource you are delete not exist.");
        }
    }
    async getAll(): Promise<Coupon[]> {
        return this.couponModel.find({ isActive: true }).exec();
    }
    async getById(id: any): Promise<Coupon> {
        return this.couponModel.findById(id).exec();
    }
}