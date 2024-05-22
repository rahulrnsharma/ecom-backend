import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { COUPON_SCHEMA, COUPON_USED_SCHEMA } from 'src/schema';
import { CouponService } from 'src/services/coupon.service';
import { CouponController } from './coupon.controller';

@Module({
    imports: [MongooseModule.forFeature([COUPON_SCHEMA, COUPON_USED_SCHEMA])],
    controllers: [CouponController],
    providers: [CouponService],
    exports: [CouponService]
})
export class AppCouponModule { }