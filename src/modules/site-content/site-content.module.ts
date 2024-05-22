import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SITE_CONTENT_SCHEMA } from 'src/schema';
import { SiteContentService } from 'src/services/site-content.service';
import { SiteContentController } from './site-content.controller';

@Module({
    imports: [MongooseModule.forFeature([SITE_CONTENT_SCHEMA])],
    controllers: [SiteContentController],
    providers: [SiteContentService],
    exports: []
})
export class AppSiteContentModule { }