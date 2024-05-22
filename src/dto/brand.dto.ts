import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString, ValidateIf } from "class-validator";
import { PaginationDto } from "./pagination.dto";
import { ActiveStatusEnum } from "src/enum/common.enum";
export class BrandDto {
    @ApiProperty()
    @IsString({ message: 'Brand Name should be string.' })
    @IsNotEmpty({ message: 'Brand Name is required.' })
    name: string;
    @ApiProperty({ type: 'file', format: 'binary', required: false })
    image?: Express.Multer.File
}

export class SearchBrandDto extends PaginationDto {
    @ApiPropertyOptional()
    @IsString({ message: 'Name should be string.' })
    @ValidateIf(o => o.name)
    name?: string;
    @ApiPropertyOptional({ enum: Object.values(ActiveStatusEnum) })
    @IsIn(Object.values(ActiveStatusEnum))
    @IsString({ message: 'Active should be string.' })
    @ValidateIf(o => o.status)
    status?: string;
}