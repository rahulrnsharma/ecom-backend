import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString, ValidateIf } from "class-validator";
import { BannerTypeEnum } from "src/enum/banner-type.enum";
export class BannerDto {
    @ApiPropertyOptional()
    @IsString({ message: 'Heading should be string.' })
    @ValidateIf(o => o.heading)
    heading: string;
    @ApiPropertyOptional()
    @IsString({ message: 'Text should be string.' })
    @ValidateIf(o => o.text)
    text: string;
    @ApiProperty({ enum: Object.values(BannerTypeEnum) })
    @IsIn(Object.values(BannerTypeEnum))
    @IsNotEmpty({ message: 'Type is required.' })
    type: string;
    @ApiPropertyOptional()
    @IsString({ message: 'url should be string.' })
    @ValidateIf(o => o.url)
    url: string;
    @ApiProperty({ type: 'file', format: 'binary', required: true })
    image: Express.Multer.File
}