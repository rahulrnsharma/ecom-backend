import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { COUPON_SCHEMA, COUPON_USED_SCHEMA, ORDER_ADDRESS_SCHEMA, ORDER_PRODUCT_SCHEMA, ORDER_REVIEW_SCHEMA, ORDER_SCHEMA, SITE_CONFIG_SCHEMA, TRANSACTION_SCHEMA, USER_CART_SCHEMA, USER_PROFILE_SCHEMA, USER_SCHEMA } from 'src/schema';
import { ApiConfigService } from 'src/services/config.service';
import { OrderService } from 'src/services/order.service';
import { SiteConfigService } from 'src/services/site-config.service';
import { UserCartService } from 'src/services/user-cart.service';
import { UtilityService } from 'src/services/utility.service';
import { OrderController } from './order.controllers';
import { FirebaseService } from 'src/services/firebase.service';

@Module({
    imports: [MongooseModule.forFeature([USER_CART_SCHEMA, COUPON_SCHEMA, COUPON_USED_SCHEMA, ORDER_SCHEMA, ORDER_PRODUCT_SCHEMA, ORDER_ADDRESS_SCHEMA, TRANSACTION_SCHEMA, USER_PROFILE_SCHEMA, SITE_CONFIG_SCHEMA, ORDER_REVIEW_SCHEMA, USER_SCHEMA])],
    controllers: [OrderController],
    providers: [OrderService, UtilityService, UserCartService, ApiConfigService, SiteConfigService, FirebaseService],
    exports: [OrderService]
})
export class AppOrderModule { }