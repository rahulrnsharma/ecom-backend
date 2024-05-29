import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/decorator/role.decorator';
import { ScopeUser } from 'src/decorator/user.decorator';
import { RoleEnum } from 'src/enum/role.enum';
import { IContextUser } from 'src/interface/user.interface';
import { AuthService } from 'src/services/auth.service';
import { JwtAuthGuard } from 'src/services/guard/jwt-auth.guard';
import { LocalAuthGuard } from 'src/services/guard/local-auth.guard';
import { RolesGuard } from 'src/services/guard/role.guard';
import { AdminLoginDto, AuthCheckDto, PasswordDto, LoginDto, AdminUserCreateDto, DeviceInfoDto } from '../../dto/login.dto';
import { FirbaseAuthGuard } from 'src/services/guard/firebase.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    @ApiExcludeEndpoint()
    @Post('create-admin')
    createAdmin(@Body() adminUserCreateDto: AdminUserCreateDto) {
        return this.authService.createAdmin(adminUserCreateDto);
    }
    @UseGuards(LocalAuthGuard)
    @Post('admin')
    adminLogin(@Body() adminLoginDto: AdminLoginDto, @ScopeUser() contextUser: IContextUser) {
        return this.authService.adminLogin(contextUser, adminLoginDto.ipAddress, adminLoginDto.platform)
    }
    @Post('check')
    async authCheck(@Body() authCheckDto: AuthCheckDto) {
        return this.authService.authCheck(authCheckDto);
    }
    // @Post('login')
    // async login(@Body() loginDto: LoginDto) {
    //     return this.authService.login(loginDto);
    // }
    // @ApiBearerAuth()
    // @UseGuards(FirbaseAuthGuard)
    // @Post('validate')
    // async validate(@ScopeUser() contextUser: IContextUser) {
    //     return contextUser;
    // }
    @ApiBearerAuth()
    @UseGuards(FirbaseAuthGuard)
    @Post('logout')
    logout(@ScopeUser() contextUser: IContextUser) {
        return this.authService.logout(contextUser);
    }
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('admin/logout')
    adminLogout(@ScopeUser() contextUser: IContextUser) {
        return this.authService.logout(contextUser);
    }
    // @HasRoles(RoleEnum.USER, RoleEnum.DELIVERY)
    // @ApiBearerAuth()
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Post('set-password')
    // async setUserPassword(@Body() passwordDto: PasswordDto, @ScopeUser() contextUser: IContextUser) {
    //     return this.authService.setUserPassword(passwordDto, contextUser);
    // }
    @HasRoles(RoleEnum.USER, RoleEnum.DELIVERY)
    @ApiBearerAuth()
    @UseGuards(FirbaseAuthGuard, RolesGuard)
    @Post('device')
    async device(@Body() deviceInfoDto: DeviceInfoDto, @ScopeUser() contextUser: IContextUser) {
        return this.authService.updateDevice(deviceInfoDto, contextUser);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.DATAMANAGEMENT)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('admin/profile')
    profileAdmin(@ScopeUser() contextUser: IContextUser) {
        return this.authService.profile(contextUser);
    }

    @HasRoles(RoleEnum.USER, RoleEnum.DELIVERY)
    @ApiBearerAuth()
    @UseGuards(FirbaseAuthGuard, RolesGuard)
    @Get('profile')
    profile(@ScopeUser() contextUser: IContextUser) {
        return this.authService.profile(contextUser);
    }
}