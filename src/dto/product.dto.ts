import { ApiProperty, ApiPropertyOptional, IntersectionType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBooleanString, IsIn, IsInt, IsMongoId, IsNotEmpty, IsString, MinLength, ValidateIf, ValidateNested } from "class-validator";
import { Types } from "mongoose";
import { ActiveStatusEnum, OfferTypeEnum, SortOrderEnum } from "src/enum/common.enum";
import { ProductStatusEnum } from "src/enum/product.enum";
import { PaginationDto, TimezoneDto } from "./pagination.dto";
import { EqualToIf, LessThanEqualTo } from "src/decorator/validation/comparison.decorator";
class ProductPackingDto {
    @ApiProperty()
    @IsInt({ message: 'Weight should be number.' })
    @IsNotEmpty({ message: 'Weight is required.' })
    weight: number;
    @ApiProperty()
    @IsInt({ message: 'MRP should be number.' })
    @IsNotEmpty({ message: 'MRP is required.' })
    mrp: number;
    @ApiProperty()
    @LessThanEqualTo('mrp', { message: 'sell should be less or equal to mrp.' })
    @IsInt({ message: 'Sell price should be number.' })
    @IsNotEmpty({ message: 'Sell price is required.' })
    sell: number;
    @ApiProperty()
    @IsInt({ message: 'Quantity should be number.' })
    @IsNotEmpty({ message: 'Quantity is required.' })
    quantity: number;
    @ApiPropertyOptional({ default: false })
    @IsBooleanString({ message: 'Offer Active should be boolean.' })
    @IsNotEmpty({ message: 'Offer Active is required.' })
    @Type(() => Boolean)
    @ValidateIf(o => o.offerActive)
    offerActive?: boolean
    @ApiPropertyOptional({ enum: Object.values(OfferTypeEnum), default: OfferTypeEnum.PERCENTAGE })
    @IsIn(Object.values(OfferTypeEnum))
    @IsString({ message: 'Offer Type should be string.' })
    @ValidateIf(o => o.offerType)
    offerType?: string;
    @ApiPropertyOptional({ default: 0 })
    @IsInt({ message: 'Offer should be number.' })
    @IsNotEmpty({ message: 'Offer is required.' })
    @ValidateIf(o => o.offer)
    offer?: number;
    @ApiPropertyOptional({ default: 0 })
    @EqualToIf('offer', 'offerType', OfferTypeEnum.FLAT, { message: 'Max offer should be equal to offer.' })
    @IsInt({ message: 'Offer Amount should be number.' })
    @IsNotEmpty({ message: 'Offer Amount is required.' })
    @ValidateIf(o => o.offer)
    offerMax?: number;
    @ApiPropertyOptional({ default: 0 })
    @IsInt({ message: 'Offer Buy should be number.' })
    @IsNotEmpty({ message: 'Offer Buy is required.' })
    @ValidateIf(o => o.offerBuy)
    offerBuy?: number;
    @ApiPropertyOptional({ default: 0 })
    @IsInt({ message: 'Offer Get should be number.' })
    @IsNotEmpty({ message: 'Offer Get is required.' })
    @ValidateIf(o => o.offerGet)
    offerGet?: number;
}
export class ProductDto {
    @ApiProperty()
    @IsString({ message: 'title should be string.' })
    @IsNotEmpty({ message: 'title is required.' })
    title: string;
    @ApiProperty()
    @IsString({ message: 'sku should be string.' })
    @IsNotEmpty({ message: 'sku is required.' })
    sku: string;
    @ApiProperty({ type: 'string' })
    @IsMongoId()
    @IsNotEmpty({ message: 'category is required.' })
    @Type(() => Types.ObjectId)
    category: Types.ObjectId;
    @ApiProperty({ type: 'string' })
    @IsMongoId()
    @IsNotEmpty({ message: 'brand is required.' })
    @Type(() => Types.ObjectId)
    brand: Types.ObjectId;
    @ApiProperty({ type: 'string' })
    @IsMongoId()
    @IsNotEmpty({ message: 'unit is required.' })
    @Type(() => Types.ObjectId)
    unit: Types.ObjectId;
    @ApiPropertyOptional()
    @ValidateIf(o => o.shop)
    @MinLength(10, { message: 'Shop address Should be greater than 10 character.' })
    @IsString({ message: 'Shop address should be string.' })
    shop: string;
    @ApiProperty()
    @MinLength(10)
    @IsString({ message: 'Short description should be string.' })
    @IsNotEmpty({ message: 'Short description is required.' })
    summary: string;
    @ApiProperty()
    @MinLength(10)
    @IsString({ message: 'description should be string.' })
    @IsNotEmpty({ message: 'description is required.' })
    description: string;
    @ApiProperty({ enum: Object.values(ProductStatusEnum) })
    @IsIn(Object.values(ProductStatusEnum))
    @IsNotEmpty({ message: 'status is required.' })
    status: string;
    @ApiProperty({ type: ProductPackingDto })
    @ValidateNested()
    packing: ProductPackingDto;
    @ApiProperty({ type: [String] })
    @IsArray()
    @ArrayMinSize(1)
    tags: string[];
    @ApiProperty()
    @IsInt({ message: 'GST percentage should be number.' })
    @IsNotEmpty({ message: 'GST percentage is required.' })
    @Type(() => Number)
    gst: number;
}
export class SearchProductDto extends IntersectionType(PaginationDto, TimezoneDto) {
    @ApiPropertyOptional()
    @IsString({ message: 'Name should be string.' })
    @ValidateIf(o => o.name)
    search?: string;
    @ApiPropertyOptional({ type: 'string' })
    @IsMongoId()
    @Type(() => Types.ObjectId)
    @ValidateIf(o => o.brand)
    brand?: Types.ObjectId;
    @ApiPropertyOptional({ type: 'string' })
    @IsMongoId()
    @Type(() => Types.ObjectId)
    @ValidateIf(o => o.category)
    category?: Types.ObjectId;
    @ApiPropertyOptional({ type: 'string' })
    @IsMongoId()
    @Type(() => Types.ObjectId)
    @ValidateIf(o => o.deal)
    deal?: Types.ObjectId;
    @ApiProperty({ enum: ['title'] })
    @IsIn(['title'])
    orderBy: string;
    @ApiProperty({ enum: Object.values(SortOrderEnum) })
    @IsIn(Object.values(SortOrderEnum))
    order: string;
}
export class AdminSearchProductDto extends SearchProductDto {
    @ApiPropertyOptional({ enum: Object.values(ProductStatusEnum) })
    @IsIn(Object.values(ProductStatusEnum))
    @IsString({ message: 'Product status should be string.' })
    @ValidateIf(o => o.productStatus)
    productStatus?: string;
    @ApiPropertyOptional({ enum: Object.values(ActiveStatusEnum) })
    @IsIn(Object.values(ActiveStatusEnum))
    @IsString({ message: 'Active should be string.' })
    @ValidateIf(o => o.status)
    status?: string;
}
export class ProductImageDto {
    @ApiProperty({ type: 'array', items: { type: 'file', format: 'binary' }, required: true })
    gallery: Express.Multer.File[];
}
export class ExcelFileDto {
    @ApiProperty({ type: 'file', format: 'binary', required: true })
    excel: Express.Multer.File;
}