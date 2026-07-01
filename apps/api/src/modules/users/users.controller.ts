import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CurrentTenant } from '../../core/tenant/tenant.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  findAll(@CurrentTenant('id') tenantId: string) {
    return this.users.findByTenant(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.users.findById(id);
  }
}
