import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/decorator/role.decorator';
import { ScopeUser } from 'src/decorator/user.decorator';
import { SiteConfigDto } from 'src/dto/site-config.dto';
import { RoleEnum } from 'src/enum/role.enum';
import { IContextUser } from 'src/interface/user.interface';
import { JwtAuthGuard } from 'src/services/guard/jwt-auth.guard';
import { RolesGuard } from 'src/services/guard/role.guard';
import { SiteConfigService } from 'src/services/site-config.service';
@ApiTags('Site Config')
@Controller('site-config')
export class SiteConfigController {
    constructor(private siteConfigService: SiteConfigService) { }


    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('')
    create(@Body() siteConfigDto: SiteConfigDto, @ScopeUser() contextUser: IContextUser) {
        return this.siteConfigService.create(siteConfigDto, contextUser);
    }
    @HasRoles(RoleEnum.USER, RoleEnum.DELIVERY)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('detail')
    getSiteConfig() {
        return this.siteConfigService.getSiteConfig();
    }
    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('')
    get() {
        return this.siteConfigService.getAll();
    }
}