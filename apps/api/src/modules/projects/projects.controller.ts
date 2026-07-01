import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service';
import { CurrentTenant } from '../../core/tenant/tenant.decorator';
import { CreateProjectDto } from './dto/create-project.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('projects')
export class ProjectsController {
  constructor(private service: ProjectsService) {}

  @Post()
  create(@CurrentTenant('id') tenantId: string, @Body() dto: CreateProjectDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  findAll(@CurrentTenant('id') tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant('id') tenantId: string) {
    return this.service.findOne(id, tenantId);
  }

  @Put(':id')
  update(@Param('id') id: string, @CurrentTenant('id') tenantId: string, @Body() dto: Partial<CreateProjectDto>) {
    return this.service.update(id, tenantId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant('id') tenantId: string) {
    return this.service.remove(id, tenantId);
  }
}
