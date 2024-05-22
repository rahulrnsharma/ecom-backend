import { AdminUserModel } from "./admin-user.schema";
import { LoginModel } from "./login.schema";
import { BrandModel } from "./brand.schema";
import { CategoryModel } from "./category.schema";
import { UnitModel } from "./unit.schema";
import { UserModel } from "./user.schema";
import { UserProfileModel } from "./user-profile.schema";
import { UserAddressModel } from "./user-address.schema";
import { UserCartModel } from "./user-cart.schema";
import { ProductModel } from "./product.schema";
import { ProductReviewModel } from "./product-review.schema";
import { ProductStockModel } from "./product-stock.schema";
import { TransactionModel } from "./transaction.schema";
import { SiteContentModel } from "./site-content.schema";
import { BannerModel } from "./banner.schema";
import { OrderModel } from "./order.schema";
import { OrderProductModel } from "./order-product.schema";
import { OrderAddressModel } from "./order-address.schema";
import { CouponModel } from "./coupon.schema";
import { CouponUsedModel } from "./coupon-used.schema";
import { InquiryModel } from "./inquiry.schema";
import { SiteConfigModel } from "./site-config.schema";
import { DealModel } from "./deal.schema";
import { OrderReviewModel } from "./order-review.schema";
import { UserReviewModel } from "./user-review.schema";

export const USER_SCHEMA = { name: UserModel.name, schema: UserModel.schema };
export const USER_REVIEW_SCHEMA = { name: UserReviewModel.name, schema: UserReviewModel.schema };
export const ADMINUSER_SCHEMA = { name: AdminUserModel.name, schema: AdminUserModel.schema };
export const UNIT_SCHEMA = { name: UnitModel.name, schema: UnitModel.schema };
export const LOGIN_SCHEMA = { name: LoginModel.name, schema: LoginModel.schema };
export const CATEGORY_SCHEMA = { name: CategoryModel.name, schema: CategoryModel.schema };
export const BRAND_SCHEMA = { name: BrandModel.name, schema: BrandModel.schema };
export const USER_PROFILE_SCHEMA = { name: UserProfileModel.name, schema: UserProfileModel.schema };
export const USER_ADDRESS_SCHEMA = { name: UserAddressModel.name, schema: UserAddressModel.schema };
export const USER_CART_SCHEMA = { name: UserCartModel.name, schema: UserCartModel.schema };
export const PRODUCT_SCHEMA = { name: ProductModel.name, schema: ProductModel.schema };
export const PRODUCT_REVIEW_SCHEMA = { name: ProductReviewModel.name, schema: ProductReviewModel.schema };
export const PRODUCT_STOCK_SCHEMA = { name: ProductStockModel.name, schema: ProductStockModel.schema };
export const TRANSACTION_SCHEMA = { name: TransactionModel.name, schema: TransactionModel.schema };
export const SITE_CONTENT_SCHEMA = { name: SiteContentModel.name, schema: SiteContentModel.schema };
export const BANNER_SCHEMA = { name: BannerModel.name, schema: BannerModel.schema };
export const ORDER_SCHEMA = { name: OrderModel.name, schema: OrderModel.schema };
export const ORDER_PRODUCT_SCHEMA = { name: OrderProductModel.name, schema: OrderProductModel.schema };
export const ORDER_ADDRESS_SCHEMA = { name: OrderAddressModel.name, schema: OrderAddressModel.schema };
export const ORDER_REVIEW_SCHEMA = { name: OrderReviewModel.name, schema: OrderReviewModel.schema };
export const COUPON_SCHEMA = { name: CouponModel.name, schema: CouponModel.schema };
export const COUPON_USED_SCHEMA = { name: CouponUsedModel.name, schema: CouponUsedModel.schema };
export const INQUIRY_SCHEMA = { name: InquiryModel.name, schema: InquiryModel.schema };
export const SITE_CONFIG_SCHEMA = { name: SiteConfigModel.name, schema: SiteConfigModel.schema };
export const DEAL_SCHEMA = { name: DealModel.name, schema: DealModel.schema };

export const ALL_SCHEMA = [
    USER_SCHEMA,
    USER_REVIEW_SCHEMA,
    ADMINUSER_SCHEMA,
    UNIT_SCHEMA,
    LOGIN_SCHEMA,
    CATEGORY_SCHEMA,
    BRAND_SCHEMA,
    USER_PROFILE_SCHEMA,
    USER_ADDRESS_SCHEMA,
    USER_CART_SCHEMA,
    PRODUCT_SCHEMA,
    PRODUCT_REVIEW_SCHEMA,
    PRODUCT_STOCK_SCHEMA,
    TRANSACTION_SCHEMA,
    SITE_CONTENT_SCHEMA,
    BANNER_SCHEMA,
    ORDER_SCHEMA,
    ORDER_PRODUCT_SCHEMA,
    ORDER_ADDRESS_SCHEMA,
    ORDER_REVIEW_SCHEMA,
    COUPON_SCHEMA,
    COUPON_USED_SCHEMA,
    INQUIRY_SCHEMA,
    SITE_CONFIG_SCHEMA,
    DEAL_SCHEMA
];
