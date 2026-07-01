import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { CurrentTenant } from '../../core/tenant/tenant.decorator';
import { CreateTaskDto } from './dto/create-task.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('tasks')
export class TasksController {
  constructor(private service: TasksService) {}

  @Post()
  create(@CurrentTenant('id') tenantId: string, @Body() dto: CreateTaskDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  findAll(@CurrentTenant('id') tenantId: string, @Query('status') status?: string) {
    return this.service.findAll(tenantId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant('id') tenantId: string) {
    return this.service.findOne(id, tenantId);
  }

  @Put(':id')
  update(@Param('id') id: string, @CurrentTenant('id') tenantId: string, @Body() dto: Partial<CreateTaskDto>) {
    return this.service.update(id, tenantId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant('id') tenantId: string) {
    return this.service.remove(id, tenantId);
  }
}
