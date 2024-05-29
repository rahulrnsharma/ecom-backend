import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CouponDto, SearchCouponDto } from "src/dto/coupon.dto";
import { ActiveStatusEnum } from "src/enum/common.enum";
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
            throw new BadRequestException("Resource you are trying to update does not exist.");
        }
    }
    async delete(id: any, contextUser: IContextUser) {
        const _doc: Coupon = await this.couponModel.findByIdAndUpdate(id, { isActive: false, updatedBy: contextUser.userId }, { runValidators: true }).exec();
        if (_doc) {
            return { success: true };
        }
        else {
            throw new BadRequestException("Resource you are trying to delete does not exist.");
        }
    }
    async getAll(query: SearchCouponDto): Promise<Coupon[]> {
        let _cond: any = {};
        if (query.status) {
            _cond['isActive'] = query.status == ActiveStatusEnum.ACTIVE;
        }
        return this.couponModel.find(_cond).exec();
    }
    async getById(id: any): Promise<Coupon> {
        return this.couponModel.findById(id).exec();
    }
}