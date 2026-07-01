import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransactionsService } from './transactions.service';
import { CurrentTenant } from '../../../core/tenant/tenant.decorator';
import { CurrentUser } from '../../../core/auth/current-user.decorator';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('transactions')
export class TransactionsController {
  constructor(private service: TransactionsService) {}

  @Post()
  create(
    @CurrentTenant('id') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Get()
  findAll(@CurrentTenant('id') tenantId: string, @Query() query: QueryTransactionDto) {
    return this.service.findAll(tenantId, query);
  }

  @Get('balance')
  getBalance(
    @CurrentTenant('id') tenantId: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getBalance(tenantId, endDate);
  }

  @Get('summary')
  getSummary(
    @CurrentTenant('id') tenantId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.service.getSummary(tenantId, startDate, endDate);
  }

  @Get('upcoming')
  getUpcoming(
    @CurrentTenant('id') tenantId: string,
    @Query('days') days?: string,
  ) {
    return this.service.getUpcoming(tenantId, days ? Number(days) : 7);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant('id') tenantId: string) {
    return this.service.findOne(id, tenantId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentTenant('id') tenantId: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.service.update(id, tenantId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant('id') tenantId: string) {
    return this.service.remove(id, tenantId);
  }
}
