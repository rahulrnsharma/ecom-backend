import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString, ValidateIf } from "class-validator";
import { ActiveStatusEnum } from "src/enum/common.enum";

export class UnitDto {
    @ApiProperty()
    @IsString({ message: 'Name should be string.' })
    @IsNotEmpty({ message: 'Name is required.' })
    name: string;
    @ApiProperty()
    @IsString({ message: 'Sort Name should be string.' })
    @IsNotEmpty({ message: 'Sort Name is required.' })
    sortName: string;
}

export class SearchUnitDto {
    @ApiPropertyOptional({ enum: Object.values(ActiveStatusEnum) })
    @IsIn(Object.values(ActiveStatusEnum))
    @IsString({ message: 'Active should be string.' })
    @ValidateIf(o => o.status)
    status?: string;
}