import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CategoriesService } from './categories.service';
import { CurrentTenant } from '../../../core/tenant/tenant.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('categories')
export class CategoriesController {
  constructor(private service: CategoriesService) {}

  @Post()
  create(@CurrentTenant('id') tenantId: string, @Body() dto: CreateCategoryDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  findAll(@CurrentTenant('id') tenantId: string, @Query('type') type?: string) {
    return this.service.findAll(tenantId, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant('id') tenantId: string) {
    return this.service.findOne(id, tenantId);
  }

  @Put(':id')
  update(@Param('id') id: string, @CurrentTenant('id') tenantId: string, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, tenantId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant('id') tenantId: string) {
    return this.service.remove(id, tenantId);
  }
}
