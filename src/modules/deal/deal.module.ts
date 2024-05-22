import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DEAL_SCHEMA, PRODUCT_SCHEMA } from 'src/schema';
import { DealController } from './deal.controller';
import { DealService } from 'src/services/deal.service';
import { UtilityService } from 'src/services/utility.service';

@Module({
    imports: [MongooseModule.forFeature([DEAL_SCHEMA, PRODUCT_SCHEMA])],
    controllers: [DealController],
    providers: [DealService, UtilityService],
    exports: []
})
export class AppDealModule { }