import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { INQUIRY_SCHEMA } from 'src/schema';
import { InquiryService } from 'src/services/inquiry.service';
import { UtilityService } from 'src/services/utility.service';
import { AppFcmModule } from '../fcm.module';
import { InquiryController } from './inquiry.controller';

@Module({
    imports: [MongooseModule.forFeature([INQUIRY_SCHEMA]), AppFcmModule],
    controllers: [InquiryController],
    providers: [InquiryService, UtilityService],
    exports: [InquiryService]
})
export class AppInquiryModule { }