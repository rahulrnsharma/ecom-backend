import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsMongoId, IsNotEmpty, IsString, ValidateIf } from "class-validator";
import { Types } from "mongoose";
import { ActiveStatusEnum } from "src/enum/common.enum";
import { PaginationDto } from "./pagination.dto";
export class CategoryDto {
    @ApiProperty()
    @IsString({ message: 'Name should be string.' })
    @IsNotEmpty({ message: 'Name is required.' })
    name: string;
    @ApiPropertyOptional({ type: 'string', default: null })
    @IsMongoId({ message: 'Not a valid parent.' })
    @Type(() => Types.ObjectId)
    @ValidateIf(o => o.parentId)
    parentId?: Types.ObjectId;
    @ApiPropertyOptional()
    @IsString({ message: 'Description should be string.' })
    @ValidateIf(o => o.description)
    description?: string;
    @ApiProperty({ type: 'file', format: 'binary', required: false })
    image?: Express.Multer.File
}

export class SearchCategoryDto extends PaginationDto {
    @ApiPropertyOptional()
    @IsString({ message: 'Name should be string.' })
    @ValidateIf(o => o.name)
    name?: string;
    @ApiPropertyOptional({ type: 'string', default: null })
    @IsMongoId({ message: 'Not a valid string.' })
    @Type(() => Types.ObjectId)
    @ValidateIf(o => o.parentId)
    parentId?: Types.ObjectId;
    @ApiPropertyOptional({ enum: Object.values(ActiveStatusEnum) })
    @IsIn(Object.values(ActiveStatusEnum))
    @IsString({ message: 'Active should be string.' })
    @ValidateIf(o => o.status)
    status?: string;
}