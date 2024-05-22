import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { WebhookDto } from "src/dto/order.dto";
import { OrderEventEnum, UserEventEnum } from "src/enum/event.enum";
import { OrderStatusEnum } from "src/enum/order.enum";
import { TransectionCategoryTypeEnum, TransectionForTypeEnum, TransectionStatusEnum, TransectionTypeEnum } from "src/enum/transection.enum";
import { OrderDocument, OrderModel } from "src/schema/order.schema";
import { TransactionDocument, TransactionModel } from "src/schema/transaction.schema";
import { UserProfileDocument, UserProfileModel } from "src/schema/user-profile.schema";

@Injectable()
export class PaymentService {
    constructor(@InjectModel(OrderModel.name) private orderModel: Model<OrderDocument>,
        @InjectModel(TransactionModel.name) private transactionModel: Model<TransactionDocument>,
        @InjectModel(UserProfileModel.name) private userProfileModel: Model<UserProfileDocument>,
        private eventEmitter: EventEmitter2) { }

    async paid(webhookDto: WebhookDto, webhookSignature: string) {
        // console.log("webhookSignature", webhookSignature)
        // console.log("WebhookDto", webhookDto)
        // let validate = validateWebhookSignature(JSON.stringify(webhookDto), webhookSignature, this.apiConfigService.razorpayWebhookSecret)
        // console.log("validate", validate)
        let _docTransaction: TransactionDocument = await this.transactionModel.findOne({ paymentId: webhookDto.payload.order.entity.id }).exec();
        _docTransaction.status = TransectionStatusEnum.SUCCESS;
        _docTransaction.data = webhookDto;
        if (_docTransaction.category == TransectionCategoryTypeEnum.ORDER) {
            const _docOrder: OrderDocument = await this.orderModel.findByIdAndUpdate(_docTransaction.transectionId, { $set: { status: OrderStatusEnum.PLACED }, $push: { 'timeline': { status: OrderStatusEnum.PLACED, summary: `order has been ${OrderStatusEnum.PLACED.toLowerCase()}.` } } }, { runValidators: true }).exec();
            if (_docOrder.wallet > 0) {
                this.updateUserWallet(_docOrder.user, _docOrder.wallet, _docOrder._id);
            }
            this.eventEmitter.emit(OrderEventEnum.ORDERPAID, { orderId: _docOrder._id, user: _docOrder.user });
        }
        if (_docTransaction.category == TransectionCategoryTypeEnum.WALLET) {
            let userProfile: UserProfileDocument = await this.userProfileModel.findOne({ user: _docTransaction.user });
            userProfile.wallet = userProfile.wallet + _docTransaction.amount;
            userProfile.save();
            this.eventEmitter.emit(UserEventEnum.WALLETADD, { wallet: userProfile.wallet, user: userProfile.user });
        }
        _docTransaction.save();
    }
    async failed(webhookDto: WebhookDto, webhookSignature: string) {
        // console.log("webhookSignature", webhookSignature)
        // console.log("WebhookDto", webhookDto)
        // let validate = validateWebhookSignature(JSON.stringify(webhookDto), webhookSignature, this.apiConfigService.razorpayWebhookSecret)
        // console.log("validate", validate)
        console.log(webhookDto.payload.payment.entity);
        let _docTransaction: TransactionDocument = await this.transactionModel.findOne({ paymentId: webhookDto.payload.payment.entity.id }).exec();
        _docTransaction.status = TransectionStatusEnum.FAILED;
        _docTransaction.data = webhookDto;
        _docTransaction.save();
    }
    async updateUserWallet(userId: any, ammount: number, order: any) {
        let userProfile: UserProfileDocument = await this.userProfileModel.findOne({ user: new Types.ObjectId(userId) });
        userProfile.wallet = userProfile.wallet - ammount;
        new this.transactionModel({
            user: userId,
            amount: ammount,
            category: TransectionCategoryTypeEnum.WALLET,
            type: TransectionTypeEnum.DEBIT,
            transectionId: order,
            for: TransectionForTypeEnum.ORDERPAYMENT,
            status: TransectionStatusEnum.SUCCESS
        }).save();
        userProfile.save();
    }
}