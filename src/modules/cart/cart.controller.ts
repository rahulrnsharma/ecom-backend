import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/decorator/role.decorator';
import { ScopeUser } from 'src/decorator/user.decorator';
import { CartDto, MultiCartDto } from 'src/dto/cart.dto';
import { CouponValidateDto } from 'src/dto/coupon.dto';
import { TimezoneDto } from 'src/dto/pagination.dto';
import { RoleEnum } from 'src/enum/role.enum';
import { IContextUser } from 'src/interface/user.interface';
import { FirbaseAuthGuard } from 'src/services/guard/firebase.guard';
import { RolesGuard } from 'src/services/guard/role.guard';
import { UserCartService } from 'src/services/user-cart.service';

@ApiTags('Cart')
@HasRoles(RoleEnum.USER)
@ApiBearerAuth()
@UseGuards(FirbaseAuthGuard, RolesGuard)
@Controller('cart')
export class CartController {
    constructor(private userCartService: UserCartService) { }

    @Post('')
    async updateSingle(@Body() cartDto: CartDto, @ScopeUser() contextUser: IContextUser) {
        return this.userCartService.updateSingle(cartDto, contextUser);
    }

    @Post('multiple')
    async updateMultiple(@Body() multiCartDto: MultiCartDto, @ScopeUser() contextUser: IContextUser) {
        return this.userCartService.updateMultiple(multiCartDto.data, contextUser);
    }

    @Post('apply/coupon')
    applyCoupon(@Body() couponValidateDto: CouponValidateDto, @ScopeUser() contextUser: IContextUser) {
        return this.userCartService.applyCoupon(couponValidateDto, contextUser);
    }

    @Post('remove/coupon')
    removeCoupon(@ScopeUser() contextUser: IContextUser) {
        return this.userCartService.removeCoupon(contextUser);
    }

    @Get('')
    async getCart(@Query() query: TimezoneDto, @ScopeUser() contextUser: IContextUser) {
        return this.userCartService.getCart(query.timezone, contextUser.userId);
    }
}