import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { COUPON_SCHEMA, COUPON_USED_SCHEMA, SITE_CONFIG_SCHEMA, USER_CART_SCHEMA } from 'src/schema';
import { SiteConfigService } from 'src/services/site-config.service';
import { UserCartService } from 'src/services/user-cart.service';
import { UtilityService } from 'src/services/utility.service';
import { CartController } from './cart.controller';

@Module({
    imports: [MongooseModule.forFeature([USER_CART_SCHEMA, COUPON_SCHEMA, COUPON_USED_SCHEMA, SITE_CONFIG_SCHEMA])],
    controllers: [CartController],
    providers: [UserCartService, UtilityService, SiteConfigService],
    exports: []
})
export class AppCartModule { }