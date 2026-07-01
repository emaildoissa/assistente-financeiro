import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MembershipsService } from './memberships.service';
import { CurrentTenant } from '../../core/tenant/tenant.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('memberships')
export class MembershipsController {
  constructor(private memberships: MembershipsService) {}

  @Get()
  list(@CurrentTenant('id') tenantId: string) {
    return this.memberships.listMembers(tenantId);
  }

  @Post()
  add(
    @CurrentTenant('id') tenantId: string,
    @Body() body: { email: string; role?: 'admin' | 'member' },
  ) {
    return this.memberships.addMember(tenantId, body.email, body.role);
  }

  @Delete(':userId')
  remove(
    @CurrentTenant('id') tenantId: string,
    @Param('userId') userId: string,
  ) {
    return this.memberships.removeMember(tenantId, userId);
  }
}
