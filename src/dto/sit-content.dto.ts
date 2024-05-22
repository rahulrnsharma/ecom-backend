import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString } from "class-validator";
import { SiteContentEnum } from "src/enum/common.enum";

export class SiteContentDto {
    @ApiProperty()
    @IsString({ message: 'Title should be string.' })
    @IsNotEmpty({ message: 'Title is required.' })
    title: string;
    @ApiProperty()
    @IsString({ message: 'Content should be string.' })
    @IsNotEmpty({ message: 'Content is required.' })
    content: string;
    @ApiProperty({ enum: Object.values(SiteContentEnum) })
    @IsIn(Object.values(SiteContentEnum))
    @IsNotEmpty({ message: 'Type is required.' })
    type: string;
}