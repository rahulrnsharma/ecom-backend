import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CATEGORY_SCHEMA, PRODUCT_REVIEW_SCHEMA, PRODUCT_SCHEMA, PRODUCT_STOCK_SCHEMA } from 'src/schema';
import { ProductService } from 'src/services/product.service';
import { UtilityService } from 'src/services/utility.service';
import { ProductController } from './product.controller';

@Module({
    imports: [MongooseModule.forFeature([PRODUCT_SCHEMA, PRODUCT_STOCK_SCHEMA, PRODUCT_REVIEW_SCHEMA, CATEGORY_SCHEMA])],
    controllers: [ProductController],
    providers: [ProductService, UtilityService],
    exports: []
})
export class AppProductModule { }