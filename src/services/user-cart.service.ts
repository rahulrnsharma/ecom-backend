import { BadRequestException, Injectable, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { CartDto } from 'src/dto/cart.dto';
import { CouponValidateDto } from 'src/dto/coupon.dto';
import { OfferTypeEnum } from 'src/enum/common.enum';
import { CouponUsedTypeEnum } from 'src/enum/coupon.enum';
import { IContextUser } from 'src/interface/user.interface';
import { CouponUsed, CouponUsedDocument, CouponUsedModel } from 'src/schema/coupon-used.schema';
import { Coupon, CouponDocument, CouponModel } from 'src/schema/coupon.schema';
import { UserCart, UserCartDocument, UserCartModel } from 'src/schema/user-cart.schema';
import { SiteConfigService } from './site-config.service';
import { UtilityService } from './utility.service';

@Injectable()
export class UserCartService {
  constructor(
    @InjectModel(UserCartModel.name) private userCartModel: Model<UserCartDocument>,
    @InjectModel(CouponModel.name) private couponModel: Model<CouponDocument>,
    @InjectModel(CouponUsedModel.name) private couponUsedModel: Model<CouponUsedDocument>,
    private readonly siteConfigService: SiteConfigService, private readonly utilityService: UtilityService
  ) { }

  async getCart(timezone: number, user: any) {
    const _config: any = await this.siteConfigService.getAll();
    let _today: Date = this.utilityService.setStartHour(new Date(), timezone);
    let query: PipelineStage[] = [this.utilityService.getMatchPipeline({ user: new Types.ObjectId(user) })];
    query.push(this.utilityService.getLookupPipeline('user-profiles', 'user', 'user', 'user', [this.utilityService.getProjectPipeline({ wallet: 1 }, false)]))
    query.push(this.utilityService.getUnwindPipeline('user'));
    query.push(this.utilityService.getLookupPipeline('coupons', 'coupon', '_id', 'coupon', [this.utilityService.getProjectPipeline({ code: 1, type: 1, value: 1, max: 1, require: 1, use: 1 }, false)]))
    query.push(this.utilityService.getUnwindPipeline('coupon'));
    query.push(this.utilityService.getUnwindPipeline('products'));
    query.push(this.utilityService.getLookupPipelineWithLet('products', { quantity: "$products.quantity" }, 'products.product', '_id', 'product',
      [
        this.utilityService.getLookupPipeline('units', 'unit', '_id', 'unit', [this.utilityService.getProjectPipeline({ name: 1, sortName: 1 }, false)]),
        this.utilityService.getLookupPipeline('deals', 'deal', '_id', 'deal', [this.utilityService.getMatchPipeline({ isActive: true, $and: [{ startDate: { $lte: _today } }, { endDate: { $gt: _today } }] }), this.utilityService.getProjectPipeline({ name: 1, startDate: 1, endDate: 1, type: 1, offerType: 1, offer: 1, offerMax: 1, offerBuy: 1, offerGet: 1 }, false)]),
        this.utilityService.getAddImageFieldPipeline("image", 'product', { $arrayElemAt: ["$gallery.image", 0] }),
        this.utilityService.getAddFieldPipeline("packing.quantity", "$$quantity"),
        this.utilityService.getProjectPipeline({
          'title': 1, 'slug': 1, 'unit': { "$first": "$unit" }, 'deal': { "$first": "$deal" }, 'packing': "$packing", 'image': 1
        }, false),
        this.utilityService.getAddFieldPipeline('packing.sellAfterOffer', {
          $round: [{
            $cond: {
              if: { $ne: [{ $ifNull: ["$deal", null] }, null] }, then:
                { $subtract: ["$packing.sell", { $ifNull: [{ $min: ["$deal.offerMax", { $cond: { if: { $eq: ["$deal.offerType", OfferTypeEnum.PERCENTAGE] }, then: { $divide: [{ $multiply: ["$deal.offer", "$packing.sell"] }, 100] }, else: "$deal.offer" } }] }, 0] }] }
              , else: "$packing.sell"
            }
          }, 2]
        }),
        this.utilityService.getAddFieldPipeline('packing.gst', { $round: [{ $divide: [{ $multiply: ["$gst", "$packing.sellAfterOffer"] }, 100] }, 2] }),
        this.utilityService.getAddFieldPipeline('packing.cgst', { $round: [{ $divide: ["$packing.gst", 2] }, 2] }),
        this.utilityService.getAddFieldPipeline('packing.sgst', { $round: [{ $divide: ["$packing.gst", 2] }, 2] })
      ]
    ));
    query.push(
      this.utilityService.getProjectPipeline({ product: { "$first": "$product" }, coupon: 1, user: 1 }, false)
    );
    query.push(
      {
        $group: {
          _id: '$_id',
          products: {
            $push: "$product"
          },
          coupon: {
            $first: "$coupon"
          },
          user: {
            $first: "$user"
          },
          totalMRP: { $sum: { $multiply: ["$product.packing.mrp", "$product.packing.quantity"] } },
          totalSell: { $sum: { $multiply: ["$product.packing.sell", "$product.packing.quantity"] } },
          totalGST: { $sum: { $multiply: ["$product.packing.gst", "$product.packing.quantity"] } },
          totalSGST: { $sum: { $multiply: ["$product.packing.sgst", "$product.packing.quantity"] } },
          totalCGST: { $sum: { $multiply: ["$product.packing.cgst", "$product.packing.quantity"] } },
          totalSellAfterOffer: { $sum: { $multiply: ["$product.packing.sellAfterOffer", "$product.packing.quantity"] } }
        }
      });
    query.push(
      this.utilityService.getAddFieldPipeline('wallet', { $round: [{ $min: [{ $ifNull: ["$user.wallet", 0] }, { $floor: { $divide: [{ $multiply: ["$totalSellAfterOffer", 10] }, 100] } }] }, 2] })
    )
    query.push(
      this.utilityService.getAddFieldPipeline('couponAmount', { $round: [{ $ifNull: [{ $min: ["$coupon.max", { $cond: { if: { $eq: ["$coupon.type", OfferTypeEnum.PERCENTAGE] }, then: { $divide: [{ $multiply: ["$coupon.value", "$totalSellAfterOffer"] }, 100] }, else: "$coupon.value" } }] }, 0] }, 2] })
    )
    query.push(
      this.utilityService.getProjectPipeline({ _id: 1, products: 1, coupon: 1, totalMRP: 1, totalSell: 1, totalGST: 1, totalSGST: 1, totalCGST: 1, totalSellAfterOffer: 1, couponAmount: 1, wallet: 1, grandTotal: { $subtract: [{ $min: ["$totalSell", "$totalSellAfterOffer"] }, { $add: ["$couponAmount", "$wallet"] }] } }, false)
    );
    const _data: any[] = await this.userCartModel.aggregate(query).exec();
    if (_data.length > 0)
      return { ..._data[0], charge: _config.deliveryCharge, grandTotal: _data[0].grandTotal + _config.deliveryCharge };
    else
      return {};
  }
  async updateSingle(cartDto: CartDto, contextUser: IContextUser) {
    this.update(cartDto, contextUser);
    return { success: true };
  }
  async updateMultiple(cartDto: CartDto[], contextUser: IContextUser) {
    for (let i = 0; i < cartDto.length; i++) {
      await this.update(cartDto[i], contextUser);
    }
    return { success: true };
  }
  async update(cartDto: CartDto, contextUser: IContextUser) {
    let userCart: UserCart;
    if (cartDto.quantity <= 0) {
      userCart = await this.userCartModel
        .findOneAndUpdate(
          { user: contextUser.userId },
          {
            updatedBy: contextUser.userId,
            $pull: {
              products: {
                product: cartDto.product
              },
            },
          },
          { new: true, runValidators: true }
        )
        .exec();
    } else {
      userCart = await this.userCartModel
        .findOneAndUpdate(
          {
            user: contextUser.userId,
            products: { "$elemMatch": { product: cartDto.product } }
          },
          {
            'products.$.quantity': cartDto.quantity,
            updatedBy: contextUser.userId,
          },
          { new: true, runValidators: true }
        )
        .exec();
      if (!userCart) {
        userCart = await this.userCartModel
          .findOneAndUpdate(
            {
              user: contextUser.userId
            },
            {
              $push: {
                'products': cartDto
              },
              updatedBy: contextUser.userId,
            },
            { new: true, runValidators: true }
          ).exec();
        if (!userCart) {
          userCart = await new this.userCartModel({
            user: contextUser.userId,
            products: [cartDto],
            createdBy: contextUser.userId,
          }).save();
        }
      }
    }
    if (userCart.products.length === 0) {
      this.userCartModel.findOneAndDelete({ user: contextUser.userId }).exec();
    }
  }
  async applyCoupon(couponValidateDto: CouponValidateDto, contextUser: IContextUser): Promise<any> {
    const coupon: Coupon = await this.couponModel.findOne({ code: couponValidateDto.code }).exec();
    if (coupon == null) {
      throw new BadRequestException(`Coupon not valid.`);
    }
    if (coupon.require > couponValidateDto.amount) {
      throw new BadRequestException(`Minmum amount for apply should be ${coupon.require}.`);
    }
    const couponUsed: CouponUsed = await this.couponUsedModel.findOne({ code: couponValidateDto.code, user: contextUser.userId }).exec();
    if (coupon.use == CouponUsedTypeEnum.SINGLE && couponUsed) {
      throw new BadRequestException("You already used this coupon before.");
    }
    let _couponAmount: number = coupon.value;
    if (coupon.type == OfferTypeEnum.PERCENTAGE) {
      _couponAmount = (coupon.value * couponValidateDto.amount) / 100;
    }
    if (_couponAmount > coupon.max) {
      _couponAmount = coupon.max;
    }
    this.userCartModel.findOneAndUpdate({ user: contextUser.userId },
      {
        $set: {
          'coupon': coupon
        },
      },
      { new: true, runValidators: true }).exec();
    return { success: true, amount: _couponAmount };
  }
  async removeCoupon(contextUser: IContextUser) {
    this.userCartModel.findOneAndUpdate({ user: contextUser.userId },
      {
        $set: {
          'coupon': null
        },
      },
      { new: true, runValidators: true }).exec();
    return { success: true };
  }
  async deleteCart(user: any) {
    return this.userCartModel.findOneAndDelete({ user: user }).exec();
  }
}
