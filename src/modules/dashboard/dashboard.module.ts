import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from 'src/services/dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ORDER_SCHEMA, USER_SCHEMA, INQUIRY_SCHEMA, PRODUCT_SCHEMA } from 'src/schema';
import { UtilityService } from 'src/services/utility.service';

@Module({
    imports: [MongooseModule.forFeature([ORDER_SCHEMA, USER_SCHEMA, INQUIRY_SCHEMA, PRODUCT_SCHEMA])],
    controllers: [DashboardController],
    providers: [DashboardService, UtilityService],
    exports: []
})
export class AppDashboardModule { }