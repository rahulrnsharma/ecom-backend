import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentService } from 'src/services/payment.service';
import { PaymentController } from './payment.controller';
import { ORDER_SCHEMA, TRANSACTION_SCHEMA, USER_PROFILE_SCHEMA } from 'src/schema';

@Module({
    imports: [MongooseModule.forFeature([ORDER_SCHEMA, TRANSACTION_SCHEMA, USER_PROFILE_SCHEMA])],
    controllers: [PaymentController],
    providers: [PaymentService],
    exports: []
})
export class AppPaymentModule { }