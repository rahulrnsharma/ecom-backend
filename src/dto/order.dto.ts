import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsMongoId, IsNotEmpty, IsString, ValidateIf, ValidateNested } from "class-validator";
import { Types } from "mongoose";
import { OrderHistoryOptionEnum, OrderPaymentOptionEnum, OrderStatusEnum } from "src/enum/order.enum";
import { AddressDto } from "./address.dto";
import { PaginationDto, TimezoneDto } from "./pagination.dto";
export class OrderDto extends TimezoneDto {
    @ApiProperty({ enum: Object.values(OrderPaymentOptionEnum) })
    @IsIn(Object.values(OrderPaymentOptionEnum))
    @IsNotEmpty({ message: 'Payment Type is required.' })
    paymentType: string;
    @ApiProperty()
    @ValidateNested()
    address: AddressDto;
}

export class SearchOrderDto extends PaginationDto {
    @ApiPropertyOptional({ enum: Object.values(OrderStatusEnum) })
    @IsIn(Object.values(OrderStatusEnum))
    @ValidateIf(o => o.status)
    status?: string;
}
export class OrderUpdateStatusWithReasonDto {
    @ApiProperty({ enum: [OrderStatusEnum.REJECT, OrderStatusEnum.RETURN, OrderStatusEnum.DELIVERED] })
    @IsIn([OrderStatusEnum.REJECT, OrderStatusEnum.RETURN, OrderStatusEnum.DELIVERED])
    @IsNotEmpty({ message: 'Status is required.' })
    status: string;
    @ApiProperty()
    @IsNotEmpty({ message: 'Reason is required.' })
    @IsString({ message: 'Reason should be string.' })
    reason: string;
}
export class OrderUpdateStatusDto {
    @IsMongoId()
    @IsNotEmpty({ message: 'Id is required.' })
    id: Types.ObjectId;
    @IsIn([OrderStatusEnum.ACCEPTED, OrderStatusEnum.PROCESSING, OrderStatusEnum.DISPATCHED])
    @IsNotEmpty({ message: 'Status is required.' })
    @IsString({ message: 'Status should be string.' })
    status: string;
}
export class OrderAssignDto {
    @ApiProperty({ type: 'string' })
    @IsMongoId()
    @IsNotEmpty({ message: 'Id is required.' })
    @Type(() => Types.ObjectId)
    order: Types.ObjectId;
    @ApiProperty({ type: 'string' })
    @IsMongoId()
    @IsNotEmpty({ message: 'Id is required.' })
    @Type(() => Types.ObjectId)
    user: Types.ObjectId;
}

export class SearchOrderHistoryDto extends PaginationDto {
    @ApiPropertyOptional({ enum: Object.values(OrderHistoryOptionEnum) })
    @IsIn(Object.values(OrderHistoryOptionEnum))
    @ValidateIf(o => o.type)
    type?: string;
}

export class WebhookDto {
    entity: string;
    account_id: string;
    event: string;
    contains: string[];
    payload: {
        payment: {
            entity: any;
        },
        order: {
            entity: any;
        }
    };
    created_at: Date;
}