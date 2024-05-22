import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ADMINUSER_SCHEMA, SITE_CONFIG_SCHEMA, TRANSACTION_SCHEMA, USER_ADDRESS_SCHEMA, USER_PROFILE_SCHEMA, USER_REVIEW_SCHEMA, USER_SCHEMA } from 'src/schema';
import { AdminUserService } from 'src/services/admin-user.service';
import { ApiConfigService } from 'src/services/config.service';
import { SiteConfigService } from 'src/services/site-config.service';
import { UserAddressService } from 'src/services/user-address.service';
import { UserService } from 'src/services/user.service';
import { UtilityService } from 'src/services/utility.service';
import { UserController } from './user.controller';

@Module({
    imports: [MongooseModule.forFeature([USER_SCHEMA, ADMINUSER_SCHEMA, USER_ADDRESS_SCHEMA, USER_PROFILE_SCHEMA, TRANSACTION_SCHEMA, SITE_CONFIG_SCHEMA, USER_REVIEW_SCHEMA])],
    controllers: [UserController],
    providers: [AdminUserService, UserService, UserAddressService, UtilityService, ApiConfigService, SiteConfigService],
    exports: [AdminUserService, UserService, UserAddressService]
})
export class AppUserModule { }