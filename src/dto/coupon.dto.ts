import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsNotEmpty, IsString } from "class-validator";
import { EqualToIf } from "src/decorator/validation/comparison.decorator";
import { OfferTypeEnum } from "src/enum/common.enum";
import { CouponUsedTypeEnum } from "src/enum/coupon.enum";

export class CouponDto {
    @ApiProperty()
    @IsString({ message: 'Coupon Code should be string.' })
    @IsNotEmpty({ message: 'Coupon Code is required.' })
    code: string;
    @ApiProperty()
    @IsString({ message: 'Description should be string.' })
    @IsNotEmpty({ message: 'Description is required.' })
    description: string;
    @ApiProperty({ enum: Object.values(CouponUsedTypeEnum) })
    @IsIn(Object.values(CouponUsedTypeEnum))
    @IsNotEmpty({ message: 'Use is required.' })
    use: string;
    @ApiProperty({ enum: Object.values(OfferTypeEnum) })
    @IsIn(Object.values(OfferTypeEnum))
    @IsNotEmpty({ message: 'Type is required.' })
    type: string;
    @ApiProperty()
    @IsInt({ message: 'Value should be number.' })
    @IsNotEmpty({ message: 'Value is required.' })
    @Type(() => Number)
    value: number;
    @ApiProperty()
    @EqualToIf('value', 'type', OfferTypeEnum.FLAT, { message: 'Max should be equal to value.' })
    @IsInt({ message: 'Max should be number.' })
    @IsNotEmpty({ message: 'Max is required.' })
    @Type(() => Number)
    max: number;
    @ApiProperty()
    @IsInt({ message: 'Require should be number.' })
    @IsNotEmpty({ message: 'Require is required.' })
    @Type(() => Number)
    require: number;
}

export class CouponValidateDto {
    @ApiProperty()
    @IsString({ message: 'Coupon Code should be string.' })
    @IsNotEmpty({ message: 'Coupon Code is required.' })
    code: string;
    @ApiProperty()
    @IsInt({ message: 'Amount should be number.' })
    @IsNotEmpty({ message: 'Amount is required.' })
    @Type(() => Number)
    amount: number;
}