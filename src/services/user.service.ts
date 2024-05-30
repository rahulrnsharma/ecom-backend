import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, PipelineStage, Types } from "mongoose";
import { AuthCheckDto, DeviceInfoDto } from "src/dto/login.dto";
import { SearchUserDto, UserDto, AmountDto } from "src/dto/user.dto";
import { SortOrderEnum } from "src/enum/common.enum";
import { TransectionCategoryTypeEnum, TransectionForTypeEnum, TransectionStatusEnum, TransectionTypeEnum } from "src/enum/transection.enum";
import { IContextUser } from "src/interface/user.interface";
import { PaginationResponse } from "src/model/pagination.model";
import { TransactionDocument, TransactionModel } from "src/schema/transaction.schema";
import { UserProfileDocument, UserProfileModel } from "src/schema/user-profile.schema";
import { UserDocument, UserModel } from "src/schema/user.schema";
import { ApiConfigService } from "./config.service";
import { UtilityService } from "./utility.service";
import { ReviewDto } from "src/dto/review.dto";
import { UserReviewDocument, UserReviewModel } from "src/schema/user-review.schema";
import { SiteConfigService } from "./site-config.service";
const TObjectId = mongoose.Types.ObjectId;
const Razorpay = require('razorpay');

@Injectable()
export class UserService {
    constructor(
        @InjectModel(UserModel.name) private userModel: Model<UserDocument>,
        @InjectModel(UserProfileModel.name) private userProfileModel: Model<UserProfileDocument>,
        @InjectModel(TransactionModel.name) private transactionModel: Model<TransactionDocument>,
        @InjectModel(UserReviewModel.name) private userReviewModel: Model<UserReviewDocument>,
        private utilityService: UtilityService, private apiConfigService: ApiConfigService,
        private readonly siteConfigService: SiteConfigService
    ) { }
    async findAll(searchDto: SearchUserDto): Promise<PaginationResponse<any>> {
        let _match: any = {};
        if (searchDto.role) {
            _match.role = searchDto.role;
        }
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline(_match)];
        query.push({
            $facet: {
                count: [{ $count: "total" }],
                data: [
                    this.utilityService.getSortPipeline('createdAt', SortOrderEnum.DESC),
                    this.utilityService.getSkipPipeline(searchDto.currentPage, searchDto.pageSize),
                    this.utilityService.getLookupPipeline('user-profiles', '_id', 'user', 'profile', [this.utilityService.getAddImageFieldPipeline('image', 'avatar', '$image'), this.utilityService.getProjectPipeline({ firstName: 1, lastName: 1, gender: 1, email: 1, image: 1, commission: 1 }, false)]),
                    this.utilityService.getProjectPipeline({ countryCode: 1, mobile: 1, role: 1, profile: { "$first": "$profile" } }, false)
                ]
            }
        });
        query.push(this.utilityService.getProjectPipeline({
            data: 1,
            count: { $ifNull: [{ $arrayElemAt: ["$count.total", 0] }, 0] }
        }, false))
        let _res: any[] = await this.userModel.aggregate(query).exec();
        return new PaginationResponse(_res[0].data, _res[0].count, searchDto.currentPage, searchDto.pageSize);
    }
    async getDetailById(id: any): Promise<any> {
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline({ _id: new Types.ObjectId(id) })];
        query.push(this.utilityService.getLookupPipeline('user-profiles', '_id', 'user', 'profile', [this.utilityService.getAddImageFieldPipeline('image', 'avatar', '$image'), this.utilityService.getProjectPipeline({ firstName: 1, lastName: 1, gender: 1, email: 1, image: 1, dob: 1, commission: 1 }, false)]));
        query.push(this.utilityService.getLookupPipeline('user-addresses', '_id', 'user', 'address', [this.utilityService.removeCommonProjectionPipeline({ user: 0 }, false)]));
        query.push(this.utilityService.getProjectPipeline({ countryCode: 1, mobile: 1, role: 1, isActive: 1, profile: { "$first": "$profile" }, address: 1 }, false));
        let _res: any[] = await this.userModel.aggregate(query).exec();
        return _res[0];
    }
    async createUser(authCheckDto: AuthCheckDto, createdBy: any): Promise<UserDocument> {
        return new this.userModel({ ...authCheckDto, createdBy: createdBy }).save();
    }
    async userProfile(id: any): Promise<any> {
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline({ _id: new Types.ObjectId(id) })];
        query.push(this.utilityService.getLookupPipeline('user-profiles', '_id', 'user', 'user', [this.utilityService.getAddImageFieldPipeline('image', 'avatar', '$image'), this.utilityService.removeCommonProjectionPipeline({ user: 0 }, false)]))
        query.push(this.utilityService.getUnwindPipeline('user'));
        query.push(this.utilityService.getLookupPipeline('user-reviews', '_id', 'user', 'review', [this.utilityService.getGroupPipeline({ _id: "$user", total: { $sum: "$rating" }, count: { $sum: 1 } }), this.utilityService.getProjectPipeline({ count: "$count", rating: { $divide: ["$total", { $cond: { if: { $ne: ["$count", 0] }, then: "$count", else: 1 } }] } }, false)]));
        query.push(this.utilityService.getUnwindPipeline('review'));
        query.push(this.utilityService.removeCommonProjectionPipeline({ password: 0, isPassword: 0, device: 0, role: 0 }, false))
        return this.userModel.aggregate(query).exec();
    }
    async updateUser(userDto: UserDto, contextUser: IContextUser): Promise<UserProfileDocument> {
        let profile = await this.userProfileModel.findOne({ user: contextUser.userId });
        if (profile) {
            profile.firstName = userDto.firstName;
            profile.lastName = userDto.lastName;
            if (userDto.dob) {
                profile.dob = this.utilityService.setStartHour(new Date(userDto.dob), userDto.dob.getTimezoneOffset());
            }
            profile.gender = userDto.gender;
            profile.email = userDto.email;
            profile.updatedBy = contextUser.userId;
        }
        else {
            start: while (true) {
                const referral = this.utilityService.getReferral();
                let _referral = await this.userProfileModel.findOne({ referral: referral });
                if (!_referral) {
                    if (userDto.dob)
                        userDto.dob = this.utilityService.setStartHour(new Date(userDto.dob), userDto.dob.getTimezoneOffset());
                    profile = new this.userProfileModel({ ...userDto, referral: referral, user: contextUser.userId, createdBy: contextUser.userId });
                    break;
                }
                else {
                    continue start
                }
            }
        }
        return profile.save();
    }
    async userImage(image: string, contextUser: IContextUser): Promise<UserProfileDocument> {
        let profile = await this.userProfileModel.findOne({ user: contextUser.userId });
        if (profile) {
            profile.image = image;
            profile.updatedBy = contextUser.userId;
        }
        else {
            const referral = this.utilityService.getReferral();
            profile = new this.userProfileModel({ image: image, referral: referral, user: contextUser.userId, createdBy: contextUser.userId });
        }
        return profile.save();
    }
    async updateDevice(deviceInfoDto: DeviceInfoDto, contextUser: IContextUser) {
        await this.userModel.findByIdAndUpdate(contextUser.userId, { $set: { device: deviceInfoDto } }, { new: true, runValidators: true });
        return { success: true };
    }
    async checkReferral(referral: string, userId: any) {
        let referredBy: UserProfileDocument = await this.userProfileModel.findOne({ referral: referral });
        if (referredBy) {
            const _config: any = await this.siteConfigService.getAll();
            let profile: any;
            start: while (true) {
                const referralCode = this.utilityService.getReferral();
                let _referral = await this.userProfileModel.findOne({ referral: referralCode });
                if (!_referral) {
                    profile = new this.userProfileModel({ referral: referralCode, referredBy: referral, wallet: _config.refereeAmount, user: userId, createdBy: userId });
                    break;
                }
                else {
                    continue start
                }
            }
            referredBy.wallet = referredBy.wallet + _config.referredAmount;
            new this.transactionModel({
                user: referredBy.user,
                amount: _config.referredAmount,
                category: TransectionCategoryTypeEnum.WALLET,
                type: TransectionTypeEnum.CREDIT,
                transectionId: userId,
                for: TransectionForTypeEnum.FORREFERRAL,
                status: TransectionStatusEnum.SUCCESS
            }).save();
            new this.transactionModel({
                user: userId,
                amount: _config.refereeAmount,
                category: TransectionCategoryTypeEnum.WALLET,
                type: TransectionTypeEnum.CREDIT,
                transectionId: referredBy.user,
                for: TransectionForTypeEnum.BEREFERRAL,
                status: TransectionStatusEnum.SUCCESS
            }).save();
            await profile.save();
            await referredBy.save();
        }
        else {
            throw new BadRequestException("Referral code does not exist.");
        }
    }
    async createWallet(amountDto: AmountDto, contextUser: IContextUser) {
        // let instance = new Razorpay({ key_id: this.apiConfigService.razorpayKeyId, key_secret: this.apiConfigService.razorpayKeySecret })
        // return await instance.orders.create({
        //     amount: amountDto.amount * 100,
        //     currency: "INR",
        // }).then((res: any) => {
        //     const transaction = new this.transactionModel({
        //         user: contextUser.userId,
        //         amount: amountDto.amount,
        //         category: TransectionCategoryTypeEnum.WALLET,
        //         type: TransectionTypeEnum.CREDIT,
        //         paymentId: res.id,
        //         for: TransectionForTypeEnum.ADDWALLET,
        //         status: TransectionStatusEnum.INITIATED
        //     });
        //     transaction.save();
        //     return { success: true, paymentId: `${res.id}`, amount: res.amount };
        // }).catch((err: any) => {
        //     throw new BadRequestException(err);
        // })
        let res ={id:Math.floor(1000000000 + Math.random() * 9000000000)}; 
        const transaction = new this.transactionModel({
            user: contextUser.userId,
            amount: amountDto.amount,
            category: TransectionCategoryTypeEnum.WALLET,
            type: TransectionTypeEnum.CREDIT,
            paymentId: res.id,
            for: TransectionForTypeEnum.ADDWALLET,
            status: TransectionStatusEnum.INITIATED
        });
        transaction.save();
        return { success: true, paymentId: `${res.id}`, amount: amountDto.amount };
    }
    async getWalletAmount(contextUser: IContextUser) {
        let profile = await this.userProfileModel.findOne({ user: contextUser.userId });
        return { wallet: profile?.wallet }
    }
    async getTransaction(contextUser: any) {
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline({ user: new TObjectId(contextUser.userId) })];
        query.push(this.utilityService.getProjectPipeline({ amount: 1, category: 1, type: 1, for: 1, status: 1, createdAt: 1 }, false))
        return this.transactionModel.aggregate(query).exec();
    }
    async dropdown(role: string) {
        let _match: any = { role: role, isActive: true };
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline(_match)];
        query.push(this.utilityService.getLookupPipeline('user-profiles', '_id', 'user', 'profile', [this.utilityService.getAddImageFieldPipeline('image', 'avatar', '$image'), this.utilityService.getProjectPipeline({ firstName: 1, lastName: 1, image: 1 }, false)]));
        query.push(this.utilityService.getProjectPipeline({ countryCode: 1, mobile: 1, profile: { "$first": "$profile" } }, false));
        return this.userModel.aggregate(query).exec();
    }
    async review(id: any, reviewDto: ReviewDto, contextUser: IContextUser) {
        return new this.userReviewModel({ ...reviewDto, user: new Types.ObjectId(id), reviewBy: contextUser.userId }).save();
    }
    async getReview(id: any, contextUser: IContextUser) {
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline({ user: new Types.ObjectId(id) })];
        query.push(this.utilityService.getLookupPipeline('user-profiles', 'reviewBy', 'user', 'reviewBy', [this.utilityService.getAddImageFieldPipeline('image', 'avatar', '$image'), this.utilityService.getProjectPipeline({ firstName: 1, lastName: 1, image: 1 }, false)]));
        query.push(this.utilityService.getUnwindPipeline('reviewBy'));
        query.push(this.utilityService.getProjectPipeline({ comment: 1, rating: 1, reviewBy: 1, createdAt: 1 }, false));
        return await this.userReviewModel.aggregate(query).exec();
    }
    async setCommission(userId: any, amountDto: AmountDto) {
        await this.userProfileModel.findOneAndUpdate({ user: new Types.ObjectId(userId) }, { $set: { commission: amountDto.amount } }, { new: true, runValidators: true });
        return { success: true };
    }
}