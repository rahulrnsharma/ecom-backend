import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PassportModule } from '@nestjs/passport';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppAuthModule } from './modules/auth/auth.module';
import { AppBannerModule } from './modules/banner/banner.module';
import { AppBrandModule } from './modules/brand/brand.module';
import { AppCartModule } from './modules/cart/cart.module';
import { AppCategoryModule } from './modules/category/category.module';
import { AppCouponModule } from './modules/coupon/coupon.module';
import { AppDatabaseModule } from './modules/database.module';
import { AppInquiryModule } from './modules/inquiry/inquiry.module';
import { AppOrderModule } from './modules/order/order.module';
import { AppProductModule } from './modules/product/product.module';
import { AppSiteConfigModule } from './modules/site-config/site-config.module';
import { AppSiteContentModule } from './modules/site-content/site-content.module';
import { AppUnitModule } from './modules/unit/unit.module';
import { AppUserModule } from './modules/user/user.module';
import { AppDashboardModule } from './modules/dashboard/dashboard.module';
import { AppPaymentModule } from './modules/payment/payment.module';
import { AppDealModule } from './modules/deal/deal.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AppSchedulerModule } from './modules/scheduler/scheduler.module';

const MODULES = [
  AppAuthModule,
  AppBannerModule,
  AppBrandModule,
  AppCartModule,
  AppCategoryModule,
  AppCouponModule,
  AppDashboardModule,
  AppDealModule,
  AppInquiryModule,
  AppOrderModule,
  AppPaymentModule,
  AppProductModule,
  AppSiteConfigModule,
  AppSiteContentModule,
  AppUnitModule,
  AppUserModule,
  AppSchedulerModule
]

@Module({
  imports: [
    PassportModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AppDatabaseModule.forRootConnection(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ...MODULES
  ],
  controllers: [AppController],
  providers: [],
  exports: [] 
})
export class AppModule { }
