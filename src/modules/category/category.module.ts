import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CATEGORY_SCHEMA } from 'src/schema';
import { CategoryService } from 'src/services/category.service';
import { UtilityService } from 'src/services/utility.service';
import { CategoryController } from './category.controller';

@Module({
    imports: [MongooseModule.forFeature([CATEGORY_SCHEMA])],
    controllers: [CategoryController],
    providers: [CategoryService,UtilityService],
    exports: [CategoryService]
})
export class AppCategoryModule { }