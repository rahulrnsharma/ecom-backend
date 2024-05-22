import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString, ValidateIf } from "class-validator";
import { InquiryStatusEnum, InquiryTypeEnum } from "src/enum/inquiry.enum";

export class InquiryDto {
    @ApiProperty()
    @IsString({ message: 'Title should be string.' })
    @IsNotEmpty({ message: 'Title is required.' })
    title: string;
    @ApiProperty()
    @IsString({ message: 'Text should be string.' })
    @IsNotEmpty({ message: 'Text is required.' })
    text: string;
    @ApiProperty({ enum: Object.values(InquiryTypeEnum) })
    @IsIn(Object.values(InquiryTypeEnum))
    @IsNotEmpty({ message: 'Type is required.' })
    type: string;
}
export class InquiryUpdateDto {
    @ApiProperty()
    @IsString({ message: 'Text should be string.' })
    @IsNotEmpty({ message: 'Text is required.' })
    text: string;
    @ApiProperty({ enum: Object.values(InquiryTypeEnum) })
    @IsIn(Object.values(InquiryTypeEnum))
    @IsNotEmpty({ message: 'Type is required.' })
    type: string;
}

export class SearchInquiryDto {
    @ApiPropertyOptional({ enum: Object.values(InquiryStatusEnum) })
    @IsIn(Object.values(InquiryStatusEnum))
    @ValidateIf(o => o.type)
    status: string;
}