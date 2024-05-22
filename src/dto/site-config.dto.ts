import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBooleanString, IsDate, IsInt, IsMobilePhone, IsNotEmpty, IsPhoneNumber, IsString, ValidateIf, ValidateNested } from "class-validator";
import { LocationDto } from "./address.dto";


export class SiteConfigDto {
    @ApiProperty()
    @IsString({ message: 'Name should be string.' })
    @IsNotEmpty({ message: 'Name is required.' })
    name: string;
    @ApiProperty()
    @IsString({ message: 'Street should be string.' })
    @IsNotEmpty({ message: 'Street is required.' })
    street: string;
    @ApiProperty()
    @IsString({ message: 'City should be string.' })
    @IsNotEmpty({ message: 'City is required.' })
    city: string;
    @ApiProperty()
    @IsString({ message: 'State should be string.' })
    @IsNotEmpty({ message: 'State is required.' })
    state: string;
    @ApiProperty()
    @IsString({ message: 'Country should be string.' })
    @IsNotEmpty({ message: 'Country is required.' })
    country: string;
    @ApiProperty()
    @ValidateNested()
    location: LocationDto;
    @ApiProperty()
    @IsString({ message: 'Pincode should be string.' })
    @IsNotEmpty({ message: 'Pincode is required.' })
    pincode: string;
    @ApiProperty()
    @IsInt({ message: 'deliveryRange should be integer.' })
    @IsNotEmpty({ message: 'deliveryRange is required.' })
    @Type(() => Number)
    deliveryRange: number;
    @ApiProperty()
    @IsInt({ message: 'deliveryCharge should be integer.' })
    @IsNotEmpty({ message: 'deliveryCharge is required.' })
    @Type(() => Number)
    deliveryCharge: number;
    @ApiProperty()
    @IsMobilePhone('en-IN')
    @IsNotEmpty({ message: 'mobile is required.' })
    mobile: string;
    @ValidateIf(o => o.landline)
    @ApiPropertyOptional()
    @IsPhoneNumber('IN')
    landline?: string;
    @ApiProperty()
    @IsInt({ message: 'referredAmount should be integer.' })
    @IsNotEmpty({ message: 'referredAmount is required.' })
    @Type(() => Number)
    referredAmount: number;
    @ApiProperty()
    @IsInt({ message: 'refereeAmount should be integer.' })
    @IsNotEmpty({ message: 'refereeAmount is required.' })
    @Type(() => Number)
    refereeAmount: number;
}