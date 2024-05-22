import { Body, Controller, Get, Post, Put, Delete, Param, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/decorator/role.decorator';
import { ScopeUser } from 'src/decorator/user.decorator';
import { DealDto, DealProductDto, SearchDealDto } from 'src/dto/deal.dto';
import { DealForEnum } from 'src/enum/common.enum';
import { RoleEnum } from 'src/enum/role.enum';
import { IContextUser } from 'src/interface/user.interface';
import { DealService } from 'src/services/deal.service';
import { JwtAuthGuard } from 'src/services/guard/jwt-auth.guard';
import { RolesGuard } from 'src/services/guard/role.guard';

@ApiTags('Deal')
@Controller('deal')
export class DealController {
    constructor(private dealService: DealService) { }
    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('')
    create(@Body() dealDto: DealDto, @ScopeUser() contextUser: IContextUser) {
        return this.dealService.create(dealDto, contextUser);
    }
    @HasRoles(RoleEnum.USER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('by-type')
    getByType(@Query() query: SearchDealDto) {
        return this.dealService.getByType(query);
    }

    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('')
    getAll() {
        return this.dealService.getAll();
    }

    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('product/:id')
    @ApiParam({ name: 'id' })
    getDealProductById(@Param('id') id: string) {
        return this.dealService.getDealProductById(id);
    }

    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get(':id')
    @ApiParam({ name: 'id' })
    getById(@Param('id') id: string) {
        return this.dealService.getById(id);
    }

    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put('product/:id')
    @ApiParam({ name: 'id' })
    addProductToDeal(@Param('id') id: string, @Body() dealProductDto: DealProductDto, @ScopeUser() contextUser: IContextUser) {
        return this.dealService.addProductToDeal(id, dealProductDto);
    }

    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put(':id')
    @ApiParam({ name: 'id' })
    update(@Param('id') id: string, @Body() dealDto: DealDto, @ScopeUser() contextUser: IContextUser) {
        return this.dealService.update(id, dealDto, contextUser);
    }

    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete('product/:id')
    @ApiParam({ name: 'id' })
    removeProductFromDeal(@Param('id') id: string, @Body() dealProductDto: DealProductDto, @ScopeUser() contextUser: IContextUser) {
        return this.dealService.removeProductFromDeal(id, dealProductDto);
    }

    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete(':id')
    @ApiParam({ name: 'id' })
    delete(@Param('id') id: string, @ScopeUser() contextUser: IContextUser) {
        return this.dealService.delete(id, contextUser);
    }
}