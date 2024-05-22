import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SITE_CONFIG_SCHEMA } from 'src/schema';
import { SiteConfigService } from 'src/services/site-config.service';
import { SiteConfigController } from './site-config.controller';

@Module({
    imports: [MongooseModule.forFeature([SITE_CONFIG_SCHEMA])],
    controllers: [SiteConfigController],
    providers: [SiteConfigService],
    exports: []
})
export class AppSiteConfigModule { }