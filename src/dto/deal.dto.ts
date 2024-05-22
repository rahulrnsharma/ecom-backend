import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsDate, IsIn, IsInt, IsNotEmpty, IsString } from "class-validator";
import { Types } from "mongoose";
import { EqualToIf, GreaterThanEqualTo } from "src/decorator/validation/comparison.decorator";
import { DealForEnum, DealTypeEnum, OfferTypeEnum } from "src/enum/common.enum";
import { TimezoneDto } from "./pagination.dto";


export class DealDto {
    @ApiProperty()
    @IsString({ message: 'Coupon Code should be string.' })
    @IsNotEmpty({ message: 'Coupon Code is required.' })
    name: string;
    @ApiProperty({ type: 'string' })
    @IsDate({ message: 'startDate is not valid.' })
    @IsNotEmpty({ message: 'startDate is required.' })
    @Type(() => Date)
    startDate: Date;
    @ApiProperty({ type: 'string' })
    @GreaterThanEqualTo('startDate', { message: 'End date should be greater than start date.' })
    @IsDate({ message: 'endDate is not valid.' })
    @IsNotEmpty({ message: 'endDate is required.' })
    @Type(() => Date)
    endDate: Date;
    @ApiProperty()
    @IsInt({ message: 'Timezone should be number.' })
    @IsNotEmpty({ message: 'Timezone is required.' })
    @Type(() => Number)
    timezone: number;
    @ApiProperty({ enum: Object.values(DealTypeEnum) })
    @IsIn(Object.values(DealTypeEnum))
    @IsNotEmpty({ message: 'Type is required.' })
    type: string;
    @ApiProperty({ enum: Object.values(OfferTypeEnum) })
    @IsIn(Object.values(OfferTypeEnum))
    @IsNotEmpty({ message: 'Offer is required.' })
    offerType: string;
    @ApiProperty()
    @IsInt({ message: 'Value should be number.' })
    @IsNotEmpty({ message: 'Value is required.' })
    @Type(() => Number)
    offer: number;
    @ApiProperty()
    @EqualToIf('offer', 'offerType', OfferTypeEnum.FLAT, { message: 'Max offer should be equal to offer.' })
    @IsInt({ message: 'Max should be number.' })
    @IsNotEmpty({ message: 'Max is required.' })
    @Type(() => Number)
    offerMax: number;
    @ApiProperty()
    @IsInt({ message: 'Get should be number.' })
    @IsNotEmpty({ message: 'Get is required.' })
    @Type(() => Number)
    offerBuy: number;
    @ApiProperty()
    @IsInt({ message: 'Buy should be number.' })
    @IsNotEmpty({ message: 'Buy is required.' })
    @Type(() => Number)
    offerGet: number;
}

export class DealProductDto {
    @ApiProperty({ type: [String] })
    @IsArray()
    @ArrayMinSize(1)
    @Type(() => Types.ObjectId)
    products: Types.ObjectId[];
}

export class SearchDealDto extends TimezoneDto {
    @ApiProperty({ enum: Object.values(DealForEnum) })
    @IsIn(Object.values(DealForEnum))
    @IsNotEmpty({ message: 'Type is required.' })
    type: string;
}