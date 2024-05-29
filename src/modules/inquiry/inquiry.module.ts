import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { INQUIRY_SCHEMA, USER_SCHEMA } from 'src/schema';
import { InquiryService } from 'src/services/inquiry.service';
import { UtilityService } from 'src/services/utility.service';
import { InquiryController } from './inquiry.controller';
import { FirebaseService } from 'src/services/firebase.service';

@Module({
    imports: [MongooseModule.forFeature([INQUIRY_SCHEMA, USER_SCHEMA])],
    controllers: [InquiryController],
    providers: [InquiryService, UtilityService, FirebaseService],
    exports: [InquiryService]
})
export class AppInquiryModule { }