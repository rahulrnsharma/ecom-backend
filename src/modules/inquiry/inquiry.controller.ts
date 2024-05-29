import { Body, Controller, Get, Post, Put, Delete, Param, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/decorator/role.decorator';
import { ScopeUser } from 'src/decorator/user.decorator';
import { InquiryDto, InquiryUpdateDto, SearchInquiryDto } from 'src/dto/inquiry.dto';
import { RoleEnum } from 'src/enum/role.enum';
import { IContextUser } from 'src/interface/user.interface';
import { FirbaseAuthGuard } from 'src/services/guard/firebase.guard';
import { JwtAuthGuard } from 'src/services/guard/jwt-auth.guard';
import { RolesGuard } from 'src/services/guard/role.guard';
import { InquiryService } from 'src/services/inquiry.service';

@ApiTags('Inquiry')
@Controller('inquiry')
export class InquiryController {
    constructor(private inquiryService: InquiryService) { }
    @HasRoles(RoleEnum.DELIVERY, RoleEnum.USER)
    @ApiBearerAuth()
    @UseGuards(FirbaseAuthGuard, RolesGuard)
    @Post('')
    create(@Body() inquiryDto: InquiryDto, @ScopeUser() contextUser: IContextUser) {
        return this.inquiryService.create(inquiryDto, contextUser);
    }
    @HasRoles(RoleEnum.DELIVERY, RoleEnum.USER)
    @ApiBearerAuth()
    @UseGuards(FirbaseAuthGuard, RolesGuard)
    @Get('')
    getAll(@Query() query: SearchInquiryDto, @ScopeUser() contextUser: IContextUser) {
        return this.inquiryService.getAll(query, contextUser);
    }
    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('admin')
    getAllAdmin(@Query() query: SearchInquiryDto, @ScopeUser() contextUser: IContextUser) {
        return this.inquiryService.getAll(query, contextUser);
    }
    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('admin/:id')
    @ApiParam({ name: 'id' })
    getByIdAdmin(@Param('id') id: string) {
        return this.inquiryService.getById(id);
    }
    @HasRoles(RoleEnum.DELIVERY, RoleEnum.USER)
    @ApiBearerAuth()
    @UseGuards(FirbaseAuthGuard, RolesGuard)
    @Get(':id')
    @ApiParam({ name: 'id' })
    getById(@Param('id') id: string) {
        return this.inquiryService.getById(id);
    }
    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put('admin/:id/close')
    @ApiParam({ name: 'id' })
    closeAdmin(@Param('id') id: string, @ScopeUser() contextUser: IContextUser) {
        return this.inquiryService.close(id, contextUser);
    }
    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put('admin/:id')
    @ApiParam({ name: 'id' })
    updateAdmin(@Param('id') id: string, @Body() inquiryDto: InquiryUpdateDto, @ScopeUser() contextUser: IContextUser) {
        return this.inquiryService.update(id, inquiryDto, contextUser);
    }

    @HasRoles(RoleEnum.DELIVERY, RoleEnum.USER)
    @ApiBearerAuth()
    @UseGuards(FirbaseAuthGuard, RolesGuard)
    @Put(':id/close')
    @ApiParam({ name: 'id' })
    close(@Param('id') id: string, @ScopeUser() contextUser: IContextUser) {
        return this.inquiryService.close(id, contextUser);
    }
    @HasRoles(RoleEnum.DELIVERY, RoleEnum.USER)
    @ApiBearerAuth()
    @UseGuards(FirbaseAuthGuard, RolesGuard)
    @Put(':id')
    @ApiParam({ name: 'id' })
    update(@Param('id') id: string, @Body() inquiryDto: InquiryUpdateDto, @ScopeUser() contextUser: IContextUser) {
        return this.inquiryService.update(id, inquiryDto, contextUser);
    }

    @HasRoles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete('admin/:id')
    @ApiParam({ name: 'id' })
    delete(@Param('id') id: string, @ScopeUser() contextUser: IContextUser) {
        return this.inquiryService.delete(id, contextUser);
    }
}