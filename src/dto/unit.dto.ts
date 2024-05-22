import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

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