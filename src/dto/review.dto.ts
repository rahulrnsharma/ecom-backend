import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, MaxLength } from "class-validator";

export class ReviewDto {
    @ApiProperty()
    @MaxLength(200)
    @IsNotEmpty({ message: 'Comment is required.' })
    comment: string;
    @ApiProperty()
    @IsNumber({ maxDecimalPlaces: 1 }, { message: 'Rating should be number.' })
    @IsNotEmpty({ message: 'Rating is required.' })
    @Type(() => Number)
    rating: number;
}