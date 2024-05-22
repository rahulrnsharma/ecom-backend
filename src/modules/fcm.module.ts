import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { USER_SCHEMA } from 'src/schema';
import { FcmNotificationService } from 'src/services/fcm-notification.service';

@Module({
    imports: [MongooseModule.forFeature([USER_SCHEMA])],
    controllers: [],
    providers: [FcmNotificationService],
    exports: [FcmNotificationService]
})
export class AppFcmModule { }