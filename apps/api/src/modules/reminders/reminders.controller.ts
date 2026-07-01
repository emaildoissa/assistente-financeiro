import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RemindersService } from './reminders.service';
import { CurrentTenant } from '../../core/tenant/tenant.decorator';
import { CreateReminderDto } from './dto/create-reminder.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('reminders')
export class RemindersController {
  constructor(private service: RemindersService) {}

  @Post()
  create(@CurrentTenant('id') tenantId: string, @Body() dto: CreateReminderDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  findAll(@CurrentTenant('id') tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant('id') tenantId: string) {
    return this.service.remove(id, tenantId);
  }
}
