import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/decorator/role.decorator';
import { ScopeUser } from 'src/decorator/user.decorator';
import { RoleEnum } from 'src/enum/role.enum';
import { IContextUser } from 'src/interface/user.interface';
import { DashboardService } from 'src/services/dashboard.service';
import { JwtAuthGuard } from 'src/services/guard/jwt-auth.guard';
import { RolesGuard } from 'src/services/guard/role.guard';

@ApiTags('Dashboard')
@HasRoles(RoleEnum.ADMIN)
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
    constructor(private dashboardService: DashboardService) { }

    @Get('order')
    getOrderDashboard(@ScopeUser() contextUser: IContextUser) {
        return this.dashboardService.getOrderDashboard();
    }
    @Get('user')
    getUserDashboard(@ScopeUser() contextUser: IContextUser) {
        return this.dashboardService.getUserDashboard();
    }
    @Get('inquiry')
    getInquiryDashboard(@ScopeUser() contextUser: IContextUser) {
        return this.dashboardService.getInquiryDashboard();
    }
    @Get('product')
    getProductDashboard(@ScopeUser() contextUser: IContextUser) {
        return this.dashboardService.getProductDashboard();
    }
    @Get('')
    getAll(@ScopeUser() contextUser: IContextUser) {
        return this.dashboardService.getDashboardData();
    }
}