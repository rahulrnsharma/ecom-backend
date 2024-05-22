import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEmail, IsIn, IsInt, IsNotEmpty, MinLength, ValidateIf } from "class-validator";
import { SexEnum } from "src/enum/common.enum";
import { RoleEnum } from "src/enum/role.enum";
import { PaginationDto } from "./pagination.dto";

export class UserDto {
    @ApiProperty()
    @MinLength(2)
    @IsNotEmpty({ message: 'firstName is required.' })
    firstName: string;
    @ApiPropertyOptional()
    lastName?: string;
    @ApiPropertyOptional({ type: 'string' })
    @IsDate({ message: 'dob is not valid.' })
    @ValidateIf(o => o.dob)
    @Type(() => Date)
    dob?: Date;
    @ValidateIf(o => o.gender)
    @IsIn(Object.values(SexEnum))
    @ApiPropertyOptional({ enum: Object.values(SexEnum) })
    gender?: string;
    @ValidateIf(o => o.email)
    @IsEmail()
    @ApiPropertyOptional()
    email?: string;
}
export class UserImageDto {
    @ApiProperty({ type: 'file', format: 'binary', required: true })
    image: Express.Multer.File;
}
export class AmountDto {
    @ApiProperty()
    @IsInt({ message: 'Amount should be number.' })
    @IsNotEmpty({ message: 'Amount is required.' })
    @Type(() => Number)
    amount: number;
}
export class SearchUserDto extends PaginationDto {
    @ApiPropertyOptional()
    @ApiProperty({ enum: [RoleEnum.USER, RoleEnum.DELIVERY] })
    @IsIn([RoleEnum.USER, RoleEnum.DELIVERY])
    @ValidateIf(o => o.role)
    role: string;
}
export class SearchAdminUserDto extends PaginationDto {
    @ApiPropertyOptional()
    @ApiProperty({ enum: [RoleEnum.DATAMANAGEMENT] })
    @IsIn([RoleEnum.DATAMANAGEMENT])
    @ValidateIf(o => o.role)
    role: string;
}