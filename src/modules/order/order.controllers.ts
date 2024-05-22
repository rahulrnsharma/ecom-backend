import { Body, Controller, Get, Post, Query, Put, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiParam, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/decorator/role.decorator';
import { ScopeUser } from 'src/decorator/user.decorator';
import { WebhookSignature } from 'src/decorator/webhook.decorator';
import { AddressDto, LocationDto } from 'src/dto/address.dto';
import { OrderAssignDto, OrderDto, OrderUpdateStatusDto, OrderUpdateStatusWithReasonDto, SearchOrderDto, SearchOrderHistoryDto, WebhookDto } from 'src/dto/order.dto';
import { ReviewDto } from 'src/dto/review.dto';
import { OrderStatusEnum } from 'src/enum/order.enum';
import { RoleEnum } from 'src/enum/role.enum';
import { IContextUser } from 'src/interface/user.interface';
import { JwtAuthGuard } from 'src/services/guard/jwt-auth.guard';
import { RolesGuard } from 'src/services/guard/role.guard';
import { OrderService } from 'src/services/order.service';

@ApiTags('Order')
@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @HasRoles(RoleEnum.USER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('place')
    async place(@Body() orderDto: OrderDto, @ScopeUser() contextUser: IContextUser) {
        return this.orderService.place(orderDto, contextUser);
    }
    @HasRoles(RoleEnum.USER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('pending/place/:id')
    @ApiParam({ name: 'id' })
    async pendingPlace(@Param('id') id: string, @ScopeUser() contextUser: IContextUser) {
        return this.orderService.pendingPlace(id, contextUser);
    }
    @HasRoles(RoleEnum.USER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('available')
    async available(@Body() address: AddressDto, @ScopeUser() contextUser: IContextUser) {
        return this.orderService.available(address, contextUser);
    }
    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('assign')
    async assignTouser(@Body() orderAssignDto: OrderAssignDto, @ScopeUser() contextUser: IContextUser) {
        return this.orderService.assignTouser(orderAssignDto, contextUser);
    }

    @HasRoles(RoleEnum.USER, RoleEnum.DELIVERY)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('history')
    async getAllByUser(@Query() query: SearchOrderHistoryDto, @ScopeUser() contextUser: IContextUser) {
        return this.orderService.getAllByUser(query, contextUser);
    }
    @HasRoles(RoleEnum.USER, RoleEnum.DELIVERY)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('history/:id')
    @ApiParam({ name: 'id' })
    async detail(@Param('id') id: string) {
        return this.orderService.detail(id);
    }
    @HasRoles(RoleEnum.DELIVERY)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('my-statics')
    async getMyStatics(@ScopeUser() contextUser: IContextUser) {
        return this.orderService.myStatics(contextUser.userId);
    }
    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    async getAll(@Query() query: SearchOrderDto) {
        return this.orderService.getAll(query);
    }
    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get(':id')
    @ApiParam({ name: 'id' })
    async getById(@Param('id') id: string) {
        return this.orderService.getById(id);
    }

    @HasRoles(RoleEnum.DELIVERY)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put('track/:id')
    @ApiParam({ name: 'id' })
    async track(@Param('id') id: string, @Body() locationDto: LocationDto, @ScopeUser() contextUser: IContextUser) {
        return this.orderService.track(id, locationDto);
    }
    @HasRoles(RoleEnum.ADMIN, RoleEnum.DELIVERY)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put(':id/status-with-reason')
    @ApiParam({ name: 'id' })
    updateStatusWithReason(@Param('id') id: string, @Body() orderUpdateStatusWithReasonDto: OrderUpdateStatusWithReasonDto, @ScopeUser() contextUser: IContextUser) {
        return this.orderService.updateStatusWithReason(id, orderUpdateStatusWithReasonDto, contextUser);
    }
    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put(':id/:status')
    @ApiParam({ name: 'id' })
    @ApiParam({ name: 'status', enum: [OrderStatusEnum.ACCEPTED, OrderStatusEnum.PROCESSING, OrderStatusEnum.DISPATCHED] })
    updateStatus(@Param() params: OrderUpdateStatusDto, @ScopeUser() contextUser: IContextUser) {
        return this.orderService.updateStatus(params.id, params.status, contextUser);
    }
    @HasRoles(RoleEnum.USER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put(':id/review')
    @ApiParam({ name: 'id' })
    async review(@Param('id') id: string, @Body() reviewDto: ReviewDto, @ScopeUser() contextUser: IContextUser) {
        return this.orderService.review(id, reviewDto, contextUser);
    }
}