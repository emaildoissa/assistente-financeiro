import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';
import { CurrentTenant } from '../../core/tenant/tenant.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get()
  getDashboard(@CurrentTenant('id') tenantId: string) {
    return this.service.getDashboard(tenantId);
  }
}
