import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DEAL_SCHEMA, PRODUCT_SCHEMA } from 'src/schema';
import { DealService } from 'src/services/deal.service';
import { SchedulerService } from 'src/services/scheduler.service';
import { UtilityService } from 'src/services/utility.service';

@Module({
    imports: [MongooseModule.forFeature([DEAL_SCHEMA, PRODUCT_SCHEMA])],
    providers: [SchedulerService, DealService, UtilityService],
})
export class AppSchedulerModule { }