import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/decorator/role.decorator';
import { ScopeUser } from 'src/decorator/user.decorator';
import { AddressDto, LocationDto } from 'src/dto/address.dto';
import { AdminUserCreateDto, AuthCheckDto } from 'src/dto/login.dto';
import { ReviewDto } from 'src/dto/review.dto';
import { SearchAdminUserDto, SearchUserDto, UserDto, UserImageDto, AmountDto } from 'src/dto/user.dto';
import { RoleEnum } from 'src/enum/role.enum';
import { IContextUser } from 'src/interface/user.interface';
import { AdminUserService } from 'src/services/admin-user.service';
import { FirbaseAuthGuard } from 'src/services/guard/firebase.guard';
import { JwtAuthGuard } from 'src/services/guard/jwt-auth.guard';
import { RolesGuard } from 'src/services/guard/role.guard';
import { UserAddressService } from 'src/services/user-address.service';
import { UserService } from 'src/services/user.service';
import { UtilityService } from 'src/services/utility.service';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(
        private userService: UserService,
        private adminUserService: AdminUserService,
        private userAddressService: UserAddressService
    ) { }

    @HasRoles(RoleEnum.USER, RoleEnum.DELIVERY)
    @ApiBearerAuth()
    @UseGuards(FirbaseAuthGuard, RolesGuard)
    @Post('image')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image', UtilityService.multerOptions("avatar", "avatar", "image", 2 * 1024 * 1024)))
    async userImage(@Body() productImageDto: UserImageDto, @ScopeUser() contextUser: IContextUser, @UploadedFile() file: Express.Multer.File) {
        return this.userService.userImage(file.filename, contextUser);
    }
    @HasRoles(RoleEnum.USER)
    @ApiBearerAuth()
    @UseGuards(FirbaseAuthGuard, RolesGuard)
    @Post('address')
    createAddress(@Body() addressDto: AddressDto, @ScopeUser() contextUser: IContextUser) {
        return this.userAddressService.create(addressDto, contextUser);
    }

    @Post('address/check')
    async checkAddress(@Body() location: LocationDto) {
        return this.userAddressService.checkAddress(location);
    }

    @HasRoles(RoleEnum.USER)
    @ApiBearerAuth()
    @UseGuards(FirbaseAuthGuard, RolesGuard)
    @Post('wallet')
    addWallet(@Body() amountDto: AmountDto, @ScopeUser() contextUser: IContextUser) {
        return this.userService.createWallet(amountDto, contextUser);
    }

    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('data-management')
    createAdminUser(@Body() adminUserCreateDto: AdminUserCreateDto, @ScopeUser() contextUser: IContextUser) {
        return this.adminUserService.createDataManagementUser(adminUserCreateDto, contextUser);
    }

    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('delivery')
    createDeliveryUser(@Body() authCheckDto: AuthCheckDto, @ScopeUser() contextUser: IContextUser) {
        return this.userService.createUser(authCheckDto, contextUser.userId);
    }

    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('')
    allUsers(@Query() query: SearchUserDto,) {
        return this.userService.findAll(query);
    }
    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('admin')
    allAdminUsers(@Query() query: SearchAdminUserDto,) {
        return this.adminUserService.findAll(query);
    }
    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('admin/:id')
    @ApiParam({ name: 'id', required: true, type: String })
    getAdminUserDetailById(@Param('id') id: string) {
        return this.adminUserService.getDetailById(id);
    }
    @HasRoles(RoleEnum.USER)
    @ApiBearerAuth()
    @UseGuards(FirbaseAuthGuard, RolesGuard)
    @Get('address')
    getAddress(@ScopeUser() contextUser: IContextUser) {
        return this.userAddressService.getAllByUser(contextUser);
    }
    @HasRoles(RoleEnum.USER)
    @ApiBearerAuth()
    @UseGuards(FirbaseAuthGuard, RolesGuard)
    @Get('address/:id')
    @ApiParam({ name: 'id', required: true, type: String })
    getAddressById(@Param('id') id: string) {
        return this.userAddressService.getById(id);
    }
    @HasRoles(RoleEnum.USER)
    @ApiBearerAuth()
    @UseGuards(FirbaseAuthGuard, RolesGuard)
    @Get('wallet')
    getWallet(@ScopeUser() contextUser: IContextUser) {
        return this.userService.getWalletAmount(contextUser);
    }
    @HasRoles(RoleEnum.USER)
    @ApiBearerAuth()
    @UseGuards(FirbaseAuthGuard, RolesGuard)
    @Get('transaction')
    getTransaction(@ScopeUser() contextUser: IContextUser) {
        return this.userService.getTransaction(contextUser);
    }
    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('dropdown')
    @ApiQuery({ name: 'role', enum: [RoleEnum.DELIVERY] })
    getByType(@Query('role') role: string) {
        return this.userService.dropdown(role);
    }
    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get(':id')
    @ApiParam({ name: 'id', required: true, type: String })
    getUserDetailById(@Param('id') id: string) {
        return this.userService.getDetailById(id);
    }
    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('admin/:id/review')
    @ApiParam({ name: 'id' })
    async getProductReviewAdmin(@Param('id') id: string, @ScopeUser() contextUser: IContextUser) {
        return this.userService.getReview(id, contextUser);
    }

    @HasRoles(RoleEnum.USER, RoleEnum.DELIVERY)
    @ApiBearerAuth()
    @UseGuards(FirbaseAuthGuard, RolesGuard)
    @Get(':id/review')
    @ApiParam({ name: 'id' })
    async getProductReview(@Param('id') id: string, @ScopeUser() contextUser: IContextUser) {
        return this.userService.getReview(id, contextUser);
    }

    @HasRoles(RoleEnum.USER, RoleEnum.DELIVERY)
    @ApiBearerAuth()
    @UseGuards(FirbaseAuthGuard, RolesGuard)
    @Put('')
    async updateUser(@Body() userDto: UserDto, @ScopeUser() contextUser: IContextUser) {
        return this.userService.updateUser({ ...userDto }, contextUser);
    }
    @HasRoles(RoleEnum.USER)
    @ApiBearerAuth()
    @UseGuards(FirbaseAuthGuard, RolesGuard)
    @Put('address/:id')
    @ApiParam({ name: 'id', required: true, type: String })
    updateAddress(@Param('id') id: string, @Body() addressDto: AddressDto, @ScopeUser() contextUser: IContextUser) {
        return this.userAddressService.update(id, addressDto, contextUser);
    }

    @HasRoles(RoleEnum.USER)
    @ApiBearerAuth()
    @UseGuards(FirbaseAuthGuard, RolesGuard)
    @Put(':id/review')
    @ApiParam({ name: 'id' })
    async review(@Param('id') id: string, @Body() reviewDto: ReviewDto, @ScopeUser() contextUser: IContextUser) {
        return this.userService.review(id, reviewDto, contextUser);
    }
    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put(':id/commission')
    @ApiParam({ name: 'id' })
    async commission(@Param('id') id: string, @Body() amountDto: AmountDto, @ScopeUser() contextUser: IContextUser) {
        return this.userService.setCommission(id, amountDto);
    }

    @HasRoles(RoleEnum.USER)
    @ApiBearerAuth()
    @UseGuards(FirbaseAuthGuard, RolesGuard)
    @Delete('address/:id')
    @ApiParam({ name: 'id', required: true, type: String })
    deleteAddress(@Param('id') id: string, @ScopeUser() contextUser: IContextUser) {
        return this.userAddressService.delete(id, contextUser);
    }
}