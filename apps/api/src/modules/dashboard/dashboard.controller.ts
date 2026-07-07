import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';
import { CurrentTenant } from '../../core/tenant/tenant.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get()
  getDashboard(
    @CurrentTenant('id') tenantId: string,
    @Query('month') month?: string,
    @Query('year') year?: string
  ) {
    return this.service.getDashboard(tenantId, month ? Number(month) : undefined, year ? Number(year) : undefined);
  }
}
