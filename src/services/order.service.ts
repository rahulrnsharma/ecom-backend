import { BadRequestException, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage, Types } from "mongoose";
import { AddressDto, LocationDto } from "src/dto/address.dto";
import { OrderAssignDto, OrderDto, OrderUpdateStatusWithReasonDto, SearchOrderDto, SearchOrderHistoryDto } from "src/dto/order.dto";
import { SortOrderEnum } from "src/enum/common.enum";
import { OrderEventEnum } from "src/enum/event.enum";
import { OrderHistoryOptionEnum, OrderPaymentOptionEnum, OrderStatusEnum } from "src/enum/order.enum";
import { RoleEnum } from "src/enum/role.enum";
import { TransectionCategoryTypeEnum, TransectionForTypeEnum, TransectionStatusEnum, TransectionTypeEnum } from "src/enum/transection.enum";
import { IContextUser } from "src/interface/user.interface";
import { PaginationResponse } from "src/model/pagination.model";
import { OrderAddress, OrderAddressDocument, OrderAddressModel } from "src/schema/order-address.schema";
import { OrderProductDocument, OrderProductModel } from "src/schema/order-product.schema";
import { Order, OrderDocument, OrderModel } from "src/schema/order.schema";
import { TransactionDocument, TransactionModel } from "src/schema/transaction.schema";
import { UserProfileDocument, UserProfileModel } from "src/schema/user-profile.schema";
import { ApiConfigService } from "./config.service";
import { FirebaseService } from "./firebase.service";
import { SiteConfigService } from "./site-config.service";
import { UserCartService } from "./user-cart.service";
import { UtilityService } from "./utility.service";
import { NotificationScreenEnum } from "src/enum/notification.enum";
import { OrderReviewDocument, OrderReviewModel } from "src/schema/order-review.schema";
import { ReviewDto } from "src/dto/review.dto";
import { NotificationDto } from "src/dto/notification.dto";
import { User, UserDocument, UserModel } from "src/schema/user.schema";
const Razorpay = require('razorpay');

@Injectable()
export class OrderService {
    constructor(@InjectModel(OrderModel.name) private orderModel: Model<OrderDocument>,
        @InjectModel(OrderProductModel.name) private orderProductModel: Model<OrderProductDocument>,
        @InjectModel(OrderAddressModel.name) private orderAddressModel: Model<OrderAddressDocument>,
        @InjectModel(TransactionModel.name) private transactionModel: Model<TransactionDocument>,
        @InjectModel(UserProfileModel.name) private userProfileModel: Model<UserProfileDocument>,
        @InjectModel(OrderReviewModel.name) private orderReviewModel: Model<OrderReviewDocument>,
        @InjectModel(UserModel.name) private userModel: Model<UserDocument>,
        private readonly utilityService: UtilityService, private readonly userCartService: UserCartService,
        private readonly siteConfigService: SiteConfigService, private apiConfigService: ApiConfigService,
        private eventEmitter: EventEmitter2, private firebaseService: FirebaseService) { }

    async getAllByUser(searchDto: SearchOrderHistoryDto, contextUser: any): Promise<PaginationResponse<any>> {
        let _match: any = { isActive: true }
        if (contextUser.roles[0] == RoleEnum.DELIVERY) {
            _match['assign'] = new Types.ObjectId(contextUser.userId);
        }
        else {
            _match['user'] = new Types.ObjectId(contextUser.userId);
        }
        if (searchDto.type == OrderHistoryOptionEnum.COMPLETED) {
            _match['status'] = { $in: [OrderStatusEnum.DELIVERED, OrderStatusEnum.FAILED, OrderStatusEnum.REJECT, OrderStatusEnum.RETURN] };
        }
        if (searchDto.type == OrderHistoryOptionEnum.PENDING) {
            _match['status'] = { $nin: [OrderStatusEnum.DELIVERED, OrderStatusEnum.FAILED, OrderStatusEnum.REJECT, OrderStatusEnum.RETURN] };
        }
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline(_match)];
        query.push({
            $facet: {
                count: [{ $count: "total" }],
                data: [
                    this.utilityService.getSortPipeline('createdAt', SortOrderEnum.DESC),
                    this.utilityService.getSkipPipeline(searchDto.currentPage, searchDto.pageSize),
                    this.utilityService.getLimitPipeline(searchDto.pageSize),
                    this.utilityService.getProjectPipeline({ user: 0, assign: 0, timeline: 0, createdBy: 0, updatedBy: 0, __v: 0, updatedAt: 0, isActive: 0 }, false)
                ],
            },
        });
        query.push(this.utilityService.getProjectPipeline({
            data: 1,
            count: { $ifNull: [{ $arrayElemAt: ["$count.total", 0] }, 0] }
        }, false))

        let _res: any[] = await this.orderModel.aggregate(query).exec();
        return new PaginationResponse(_res[0].data, _res[0].count, searchDto.currentPage, searchDto.pageSize);
    }
    async place(orderDto: OrderDto, contextUser: IContextUser) {
        const cart: any = await this.userCartService.getCart(orderDto.timezone, contextUser.userId);
        if (!cart) {
            throw new BadRequestException(`Your cart is empty.`);
        }
        const _config: any = await this.siteConfigService.getAll();
        const _distance: number = this.utilityService.getDistance(_config.location.lat, _config.location.long, Number(orderDto.address.location.lat), Number(orderDto.address.location.long));
        if (_distance > _config.deliveryRange) {
            throw new BadRequestException(`Delivery not available on this address.`);
        }
        if (cart.coupon) {
            delete cart.coupon._id;
        }
        const order = new this.orderModel({
            number: this.utilityService.getOrderNumber(),
            status: orderDto.paymentType == OrderPaymentOptionEnum.COD ? OrderStatusEnum.PLACED : OrderStatusEnum.PENDING,
            paymentType: orderDto.paymentType,
            isCouponApply: cart.coupon != null,
            couponAmount: cart.couponAmount,
            coupon: cart.coupon,
            wallet: cart.wallet,
            mrp: cart.totalMRP,
            sell: cart.totalSell,
            amount: cart.totalSellAfterOffer,
            gst: cart.totalGST,
            sgst: cart.totalSGST,
            cgst: cart.totalCGST,
            pay: cart.grandTotal,
            createdBy: contextUser.userId,
            user: contextUser.userId,
            charge: cart.charge,
            timeline: orderDto.paymentType == OrderPaymentOptionEnum.COD ? [{ status: OrderStatusEnum.PLACED, summary: `An order has been placed.` }] : [{ status: OrderStatusEnum.PENDING, summary: `order has been ${OrderStatusEnum.PENDING.toLowerCase()} for payment.` }]
        });
        const address = new this.orderAddressModel({
            ...orderDto.address,
            order: order
        })
        let products = [];
        cart.products.forEach((obj: any) => {
            products.push(
                new this.orderProductModel({
                    order: order,
                    product: obj._id,
                    packing: obj.packing,
                    deal: obj.deal
                })
            )
        })
        let response: any = {};
        if (orderDto.paymentType == OrderPaymentOptionEnum.ONLINE) {
            let instance = new Razorpay({ key_id: this.apiConfigService.razorpayKeyId, key_secret: this.apiConfigService.razorpayKeySecret })
            await instance.orders.create({
                amount: order.pay * 100,
                currency: "INR",
            }).then((res: any) => {
                const transaction = new this.transactionModel({
                    user: contextUser.userId,
                    amount: order.pay,
                    category: TransectionCategoryTypeEnum.ORDER,
                    type: TransectionTypeEnum.CREDIT,
                    transectionId: order._id,
                    paymentId: res.id,
                    for: TransectionForTypeEnum.ORDERPAYMENT,
                    status: TransectionStatusEnum.INITIATED
                });
                transaction.save();
                response = { success: true, paymentId: `${res.id}`, amount: res.amount };
            }).catch((err: any) => {
                throw new BadRequestException(err);
            })
        }
        else {
            if (order.wallet > 0) {
                this.updateUserWallet(order.user, order.wallet, order._id);
            }
            response = { success: true };
        }
        order.save();
        address.save();
        products.forEach((obj: OrderProductDocument) => {
            obj.save();
        })
        await this.userCartService.deleteCart(contextUser.userId);
        this.eventEmitter.emit(OrderEventEnum.ORDERNEW, { orderId: order._id });
        return response;
    }
    async detail(orderId: any) {
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline({ _id: new Types.ObjectId(orderId) })];
        query.push(this.utilityService.getLookupPipeline('users', 'user', '_id', 'user', [this.utilityService.getLookupPipeline('user-profiles', '_id', 'user', 'detail', [this.utilityService.getAddImageFieldPipeline('image', 'avatar', '$image'), this.utilityService.getProjectPipeline({ firstName: 1, lastName: 1, email: 1, image: 1 }, false)]), this.utilityService.getProjectPipeline({ countryCode: 1, mobile: 1, 'detail': { "$first": "$detail" } }, false)]))
        query.push(this.utilityService.getUnwindPipeline('user'))
        query.push(this.utilityService.getLookupPipeline('users', 'assign', '_id', 'assign', [this.utilityService.getLookupPipeline('user-profiles', '_id', 'user', 'detail', [this.utilityService.getAddImageFieldPipeline('image', 'avatar', '$image'), this.utilityService.getProjectPipeline({ firstName: 1, lastName: 1, email: 1, image: 1 }, false)]),
        this.utilityService.getLookupPipeline('user-reviews', '_id', 'user', 'review', [this.utilityService.getGroupPipeline({ _id: "$product", total: { $sum: "$rating" }, count: { $sum: 1 } }), this.utilityService.getProjectPipeline({ count: "$count", rating: { $divide: ["$total", { $cond: { if: { $ne: ["$count", 0] }, then: "$count", else: 1 } }] } }, false)]),
        this.utilityService.getProjectPipeline({ countryCode: 1, mobile: 1, 'detail': { "$first": "$detail" }, 'review': { "$first": "$review" } }, false)]))
        query.push(this.utilityService.getUnwindPipeline('assign'))
        query.push(this.utilityService.getLookupPipeline('order-addresses', '_id', 'order', 'address', [this.utilityService.removeCommonProjectionPipeline({ order: 0 }, true)]))
        query.push(this.utilityService.getUnwindPipeline('address'))
        query.push(this.utilityService.getLookupPipeline('order-products', '_id', 'order', 'products', [
            this.utilityService.getLookupPipeline('products', 'product', '_id', 'product', [
                this.utilityService.getLookupPipeline('units', 'unit', '_id', 'unit', [this.utilityService.getProjectPipeline({ name: 1, sortName: 1 }, false)]),
                this.utilityService.getAddImageFieldPipeline("image", 'product', { $arrayElemAt: ["$gallery.image", 0] }),
                this.utilityService.getProjectPipeline({ 'title': 1, 'unit': { "$first": "$unit" }, 'image': 1 }, false)
            ]),
            this.utilityService.getUnwindPipeline('product'),
            this.utilityService.removeCommonProjectionPipeline({ order: 0 }, true)
        ]))
        query.push(this.utilityService.getProjectPipeline({ createdBy: 0, updatedBy: 0, __v: 0, updatedAt: 0 }, false))
        const _data: any[] = await this.orderModel.aggregate(query).exec();
        return _data[0];
    }
    async getAll(searchOrderDto: SearchOrderDto): Promise<PaginationResponse<any>> {
        let _match: any = { isActive: true };
        if (searchOrderDto.status) {
            _match.status = searchOrderDto.status;
        }
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline(_match)];
        query.push({
            $facet: {
                count: [{ $count: "total" }],
                data: [
                    this.utilityService.getSortPipeline('createdAt', SortOrderEnum.DESC),
                    this.utilityService.getSkipPipeline(searchOrderDto.currentPage, searchOrderDto.pageSize),
                    this.utilityService.getLimitPipeline(searchOrderDto.pageSize),
                    this.utilityService.getProjectPipeline({ user: 0, assign: 0, timeline: 0, createdBy: 0, updatedBy: 0, __v: 0, updatedAt: 0, isActive: 0 }, false)
                ],
            },
        });
        query.push(this.utilityService.getProjectPipeline({
            data: 1,
            count: { $ifNull: [{ $arrayElemAt: ["$count.total", 0] }, 0] }
        }, false))
        let _res: any[] = await this.orderModel.aggregate(query).exec();
        return new PaginationResponse(_res[0].data, _res[0].count, searchOrderDto.currentPage, searchOrderDto.pageSize);
    }
    async getById(id: any) {
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline({ _id: new Types.ObjectId(id) })];
        query.push(this.utilityService.getLookupPipeline('users', 'user', '_id', 'user', [this.utilityService.getLookupPipeline('user-profiles', '_id', 'user', 'detail', [this.utilityService.getAddImageFieldPipeline('image', 'avatar', '$image'), this.utilityService.getProjectPipeline({ firstName: 1, lastName: 1, email: 1, image: 1 }, false)]), this.utilityService.getProjectPipeline({ countryCode: 1, mobile: 1, 'detail': { "$first": "$detail" } }, false)]))
        query.push(this.utilityService.getUnwindPipeline('user'))
        query.push(this.utilityService.getLookupPipeline('users', 'assign', '_id', 'assign', [this.utilityService.getLookupPipeline('user-profiles', '_id', 'user', 'detail', [this.utilityService.getAddImageFieldPipeline('image', 'avatar', '$image'), this.utilityService.getProjectPipeline({ firstName: 1, lastName: 1, email: 1, image: 1 }, false)]),
        this.utilityService.getLookupPipeline('user-reviews', '_id', 'user', 'review', [this.utilityService.getGroupPipeline({ _id: "$product", total: { $sum: "$rating" }, count: { $sum: 1 } }), this.utilityService.getProjectPipeline({ count: "$count", rating: { $divide: ["$total", { $cond: { if: { $ne: ["$count", 0] }, then: "$count", else: 1 } }] } }, false)]),
        this.utilityService.getProjectPipeline({ countryCode: 1, mobile: 1, 'detail': { "$first": "$detail" }, 'review': { "$first": "$review" } }, false)]))
        query.push(this.utilityService.getUnwindPipeline('assign'))
        query.push(this.utilityService.getLookupPipeline('order-addresses', '_id', 'order', 'address', [this.utilityService.removeCommonProjectionPipeline({ order: 0 }, true)]))
        query.push(this.utilityService.getUnwindPipeline('address'))
        query.push(this.utilityService.getLookupPipeline('order-products', '_id', 'order', 'products', [
            this.utilityService.getLookupPipeline('products', 'product', '_id', 'product', [
                this.utilityService.getLookupPipeline('units', 'unit', '_id', 'unit', [this.utilityService.getProjectPipeline({ name: 1, sortName: 1 }, false)]),
                this.utilityService.getAddImageFieldPipeline("image", 'product', { $arrayElemAt: ["$gallery.image", 0] }),
                this.utilityService.getProjectPipeline({ 'title': 1, 'unit': { "$first": "$unit" }, 'image': 1 }, false)
            ]),
            this.utilityService.getUnwindPipeline('product'),
            this.utilityService.removeCommonProjectionPipeline({ order: 0 }, true)
        ]))
        query.push(this.utilityService.getProjectPipeline({ createdBy: 0, updatedBy: 0, __v: 0, updatedAt: 0 }, false))
        const _data: any[] = await this.orderModel.aggregate(query).exec();
        return _data[0];
    }
    async updateStatus(id: any, status: string, contextUser: IContextUser) {
        const _doc: Order = await this.orderModel.findByIdAndUpdate(id, { $set: { status: status, updatedBy: contextUser.userId }, $push: { 'timeline': { status: status, summary: `order has been ${status.toLowerCase()}.` } } }, { runValidators: true }).exec();
        if (_doc) {
            this.eventEmitter.emit(OrderEventEnum.STATUSCHANGE, { orderId: id, status: status, user: _doc.user });
            this.sendNotification(_doc.user, { notification: { title: `Order ${status}`, body: `order(${_doc.number}) has been ${status.toLowerCase()}.` }, data: { url: `pmart://${NotificationScreenEnum.ORDERDETAIL}/${id}` } });
            return { success: true }
        }
        else {
            throw new BadRequestException("Resource you are Updating not exist.");
        }
    }
    async updateStatusWithReason(id: any, orderUpdateStatusWithReasonDto: OrderUpdateStatusWithReasonDto, contextUser: IContextUser) {
        const _doc: Order = await this.orderModel.findByIdAndUpdate(id, { $set: { ...orderUpdateStatusWithReasonDto, updatedBy: contextUser.userId }, $push: { 'timeline': { status: orderUpdateStatusWithReasonDto.status, summary: `order has been ${orderUpdateStatusWithReasonDto.status.toLowerCase()}.`, remark: orderUpdateStatusWithReasonDto.reason } } }, { runValidators: true }).exec();
        if (_doc) {
            this.eventEmitter.emit(OrderEventEnum.STATUSCHANGE, { orderId: id, status: orderUpdateStatusWithReasonDto.status, reason: orderUpdateStatusWithReasonDto.reason, user: _doc.user });
            this.sendNotification(_doc.user, { notification: { title: `Order ${orderUpdateStatusWithReasonDto.status}`, body: `order(${_doc.number}) has been ${orderUpdateStatusWithReasonDto.status.toLowerCase()}.` }, data: { url: `pmart://${NotificationScreenEnum.ORDERDETAIL}/${id}` } });
            return { success: true }
        }
        else {
            throw new BadRequestException("Resource you are Updating not exist.");
        }
    }
    async assignTouser(orderAssignDto: OrderAssignDto, contextUser: IContextUser) {
        let userProfile: UserProfileDocument = await this.userProfileModel.findOne({ user: new Types.ObjectId(orderAssignDto.user) });
        const _doc: Order = await this.orderModel.findByIdAndUpdate(orderAssignDto.order, { $set: { assign: orderAssignDto.user, assigneeFee: userProfile.commission, updatedBy: contextUser.userId } }, { runValidators: true }).exec();
        if (_doc) {
            this.eventEmitter.emit(OrderEventEnum.ORDERASSIGN, { orderId: orderAssignDto.order, user: _doc.user });
            this.sendNotification(_doc.user, { notification: { title: `Order Assign`, body: `order(${_doc.number}) has been assign to delivery.` }, data: { url: `pmart://${NotificationScreenEnum.ORDERDETAIL}/${orderAssignDto.order}` } });
            return _doc
        }
        else {
            throw new BadRequestException("Resource you are trying to update does not exist.");
        }
    }
    async track(orderId: any, locationDto: LocationDto) {
        const _doc: OrderAddress = await this.orderAddressModel.findOneAndUpdate({ order: new Types.ObjectId(orderId) },
            { $push: { 'track': locationDto } }, { runValidators: true }).exec();
        if (_doc) {
            this.eventEmitter.emit(OrderEventEnum.ORDETRACK, { orderId: orderId, lastLocation: locationDto });
            return { success: true }
        }
        else {
            throw new BadRequestException("Resource you are trying to update does not exist.");
        }
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
    async available(address: AddressDto, contextUser: IContextUser) {
        const _config: any = await this.siteConfigService.getAll();
        const _distance: number = this.utilityService.getDistance(_config.location.lat, _config.location.long, Number(address.location.lat), Number(address.location.long));
        if (_distance > _config.deliveryRange) {
            throw new BadRequestException(`Delivery not available on this address.`);
        }
        return { available: true };
    }
    async pendingPlace(orderId: any, contextUser: IContextUser) {
        let order: any = await this.orderModel.findOne({ _id: new Types.ObjectId(orderId), status: OrderStatusEnum.PENDING }).exec();
        if (order) {
            let response: any = {};
            let instance = new Razorpay({ key_id: this.apiConfigService.razorpayKeyId, key_secret: this.apiConfigService.razorpayKeySecret })
            await instance.orders.create({
                amount: order.pay * 100,
                currency: "INR",
            }).then((res: any) => {
                const transaction = new this.transactionModel({
                    user: contextUser.userId,
                    amount: order.pay,
                    category: TransectionCategoryTypeEnum.ORDER,
                    type: TransectionTypeEnum.CREDIT,
                    transectionId: order._id,
                    paymentId: res.id,
                    for: TransectionForTypeEnum.ORDERPAYMENT,
                    status: TransectionStatusEnum.INITIATED
                });
                transaction.save();
                response = { success: true, paymentId: `${res.id}`, amount: res.amount };
            }).catch((err: any) => {
                throw new BadRequestException(err);
            })
            return response;
        }
        else {
            throw new BadRequestException('your order not found.');
        }
    }
    async review(id: any, reviewDto: ReviewDto, contextUser: IContextUser) {
        return new this.orderReviewModel({ ...reviewDto, order: new Types.ObjectId(id), reviewBy: contextUser.userId }).save();
    }
    async myStatics(id: any) {
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline({ assign: new Types.ObjectId(id), status: OrderStatusEnum.DELIVERED })];
        query.push(this.utilityService.getGroupPipeline({
            _id: null, count: { $sum: 1 }, earning: { $sum: "$assigneeFee" }
        }));
        query.push(this.utilityService.getProjectPipeline({ _id: 0, count: 1, earning: 1 }, false));
        let _res: any[] = await this.orderModel.aggregate(query);
        return _res[0] || {};
    }
    private async sendNotification(id: any, notification: NotificationDto) {
        const user: User = await this.userModel.findById(id).exec();
        if (user && user.device) {
            this.firebaseService.sendNotification(user.device.deviceToken, notification);
        }
    }
}