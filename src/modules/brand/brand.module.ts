import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BRAND_SCHEMA } from 'src/schema';
import { BrandService } from 'src/services/brand.service';
import { UtilityService } from 'src/services/utility.service';
import { BrandController } from './brand.controller';

@Module({
    imports: [MongooseModule.forFeature([BRAND_SCHEMA])],
    controllers: [BrandController],
    providers: [BrandService,UtilityService],
    exports: [BrandService]
})
export class AppBrandModule { }