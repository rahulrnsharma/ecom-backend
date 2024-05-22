import { ApiProperty, ApiPropertyOptional, IntersectionType } from "@nestjs/swagger";
import { IsIn, IsIP, IsMobilePhone, IsNotEmpty, MaxLength, MinLength, ValidateIf } from "class-validator";
import { LoginTypeEnum } from "src/enum/login-type.enum";
import { PlatformTypeEnum } from "src/enum/platform.enum";
import { RoleEnum } from "src/enum/role.enum";

export class AuthCheckDto {
    @IsNotEmpty({ message: 'Country Code is required.' })
    @ApiProperty()
    countryCode: string;
    @ApiProperty()
    @IsMobilePhone('en-IN')
    @IsNotEmpty({ message: 'mobile is required.' })
    mobile: string;
    @ApiProperty({ enum: [RoleEnum.USER, RoleEnum.DELIVERY] })
    @IsIn([RoleEnum.USER, RoleEnum.DELIVERY])
    role: string;
}

export class PasswordDto {
    @ApiProperty()
    @MaxLength(15)
    @MinLength(8)
    @IsNotEmpty({ message: 'Password is required.' })
    password: string;
}

export class IpPlatformDto {
    @ApiPropertyOptional()
    @IsIP()
    @ValidateIf(o => o.ipAddress)
    ipAddress?: string;
    @ApiPropertyOptional({ enum: Object.values(PlatformTypeEnum) })
    @IsIn(Object.values(PlatformTypeEnum))
    @ValidateIf(o => o.platform)
    platform?: string;
}

export class LoginDto extends IntersectionType(AuthCheckDto, IpPlatformDto) {
    @ApiProperty({ enum: Object.values(LoginTypeEnum) })
    @IsIn(Object.values(LoginTypeEnum))
    type: string;
    @ApiPropertyOptional()
    @IsNotEmpty({ message: 'password is required.' })
    @ValidateIf(o => o.password)
    password?: string;
    @ApiPropertyOptional()
    @IsNotEmpty({ message: 'Referral is required.' })
    @MinLength(11, { message: "Referral code is not valid." })
    @MaxLength(11, { message: "Referral code is not valid." })
    @ValidateIf(o => o.referral)
    referral?: string;
}

export class AdminLoginDto extends IpPlatformDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Username is required.' })
    username: string;
    @ApiProperty()
    @IsNotEmpty({ message: 'Password is required.' })
    password: string;
}

export class AdminUserCreateDto {
    @ApiProperty()
    @MinLength(2)
    @IsNotEmpty({ message: 'First Name is required.' })
    firstName: string;
    @ApiPropertyOptional()
    lastName?: string;
    @ApiProperty()
    @MinLength(2)
    @IsNotEmpty({ message: 'User name is required.' })
    userName: string;
    @ApiProperty()
    @MinLength(6, { message: 'Password should be minimum 6 character.' })
    @IsNotEmpty({ message: 'Password is required.' })
    password: string;
}

export class DeviceInfoDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'deviceId is required.' })
    deviceId: string;
    @ApiProperty()
    @IsNotEmpty({ message: 'deviceName is required.' })
    deviceName: string;
    @ApiProperty()
    @IsNotEmpty({ message: 'deviceToken is required.' })
    deviceToken: string;
}