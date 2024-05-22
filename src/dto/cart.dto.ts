import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsInt, IsMongoId, IsNotEmpty, IsString, Min, ValidateNested } from "class-validator";
import { Types } from "mongoose";

export class CartDto {
    @ApiProperty({ type: 'string' })
    @IsMongoId({ message: 'Not a valid product.' })
    @IsNotEmpty({ message: 'Product is required.' })
    @Type(() => Types.ObjectId)
    product: Types.ObjectId;
    @ApiProperty()
    @Min(0, { message: 'Quantity should be greater than -1.' })
    @IsInt({ message: 'Quantity should be a number.' })
    @IsNotEmpty({ message: 'Quantity is required.' })
    quantity: number;
}

export class MultiCartDto {
    @ApiProperty({ type: [CartDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested()
    data: CartDto[]
}