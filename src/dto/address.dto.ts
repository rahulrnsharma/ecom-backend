import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsLatitude, IsLongitude, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { AddressTypeEnum } from "src/enum/address.enum";

export class LocationDto {
    @ApiProperty()
    @IsLatitude({ message: 'Latitude should be correct.' })
    @IsString({ message: 'Latitude should be string.' })
    @IsNotEmpty({ message: 'Latitude is required.' })
    lat: string;
    @ApiProperty()
    @IsLongitude({ message: 'Longitude should be correct.' })
    @IsString({ message: 'Longitude should be string.' })
    @IsNotEmpty({ message: 'Longitude is required.' })
    long: string;
}

export class AddressDto {
    @ApiProperty()
    @IsString({ message: 'Street should be string.' })
    @IsNotEmpty({ message: 'Street is required.' })
    street: string;
    @ApiProperty({ enum: Object.values(AddressTypeEnum) })
    @IsIn(Object.values(AddressTypeEnum))
    @IsString({ message: 'Type should be string.' })
    @IsNotEmpty({ message: 'Type is required.' })
    type: string;
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
}