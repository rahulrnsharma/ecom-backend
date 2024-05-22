import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BANNER_SCHEMA } from 'src/schema';
import { BannerService } from 'src/services/banner.service';
import { UtilityService } from 'src/services/utility.service';
import { BannerController } from './banner.controller';

@Module({
    imports: [MongooseModule.forFeature([BANNER_SCHEMA])],
    controllers: [BannerController],
    providers: [BannerService,UtilityService],
    exports: [BannerService]
})
export class AppBannerModule { }