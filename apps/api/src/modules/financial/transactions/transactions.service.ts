import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string | undefined, dto: CreateTransactionDto) {
    return this.prisma.financialTransaction.create({
      data: {
        tenantId,
        userId,
        type: dto.type,
        amount: new Prisma.Decimal(dto.amount),
        description: dto.description,
        transactionDate: new Date(dto.transactionDate),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : null,
        status: (dto.status as any) ?? 'pending',
        categoryId: dto.categoryId,
        recurrence: dto.recurrence ?? 'none',
        recurrenceEnd: dto.recurrenceEndDate ? new Date(dto.recurrenceEndDate) : null,
        source: dto.source ?? 'manual',
        metadata: dto.metadata ?? {},
      },
      include: { category: true },
    });
  }

  async findAll(tenantId: string, query: QueryTransactionDto) {
    const where: any = { tenantId };

    if (query.startDate) where.transactionDate = { gte: new Date(query.startDate) };
    if (query.endDate) where.transactionDate = { ...where.transactionDate, lte: new Date(query.endDate) };
    if (query.type) where.type = query.type;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.status) where.status = query.status;

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.financialTransaction.findMany({
        where,
        include: { category: true },
        orderBy: { transactionDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.financialTransaction.count({ where }),
    ]);

    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string, tenantId: string) {
    const tx = await this.prisma.financialTransaction.findFirst({
      where: { id, tenantId },
      include: { category: true, files: true },
    });
    if (!tx) throw new NotFoundException('Transaction not found');
    return tx;
  }

  async update(id: string, tenantId: string, dto: UpdateTransactionDto) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.amount) data.amount = new Prisma.Decimal(dto.amount);
    if (dto.transactionDate) data.transactionDate = new Date(dto.transactionDate);
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
    if (dto.paymentDate) data.paymentDate = new Date(dto.paymentDate);
    if (dto.recurrenceEndDate) data.recurrenceEnd = new Date(dto.recurrenceEndDate);

    return this.prisma.financialTransaction.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.financialTransaction.delete({ where: { id } });
  }

  async getBalance(tenantId: string, endDate?: string) {
    const dateFilter = endDate ? { lte: new Date(endDate) } : undefined;

    const [incomeResult, expenseResult] = await Promise.all([
      this.prisma.financialTransaction.aggregate({
        where: {
          tenantId,
          type: 'income',
          transactionDate: dateFilter,
          status: { not: 'cancelled' },
        },
        _sum: { amount: true },
      }),
      this.prisma.financialTransaction.aggregate({
        where: {
          tenantId,
          type: 'expense',
          transactionDate: dateFilter,
          status: { not: 'cancelled' },
        },
        _sum: { amount: true },
      }),
    ]);

    const income = Number(incomeResult._sum.amount ?? 0);
    const expense = Number(expenseResult._sum.amount ?? 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  }

  async getSummary(tenantId: string, startDate: string, endDate: string) {
    const transactions = await this.prisma.financialTransaction.findMany({
      where: {
        tenantId,
        transactionDate: { gte: new Date(startDate), lte: new Date(endDate) },
        status: { not: 'cancelled' },
      },
      include: { category: true },
    });

    const byCategory: Record<string, { income: number; expense: number; count: number }> = {};

    for (const tx of transactions) {
      const catName = tx.category?.name ?? 'Sem categoria';
      if (!byCategory[catName]) byCategory[catName] = { income: 0, expense: 0, count: 0 };
      byCategory[catName][tx.type] += Number(tx.amount);
      byCategory[catName].count++;
    }

    return {
      period: { startDate, endDate },
      totalIncome: Number(transactions.filter(t => t.type === 'income').reduce((a, t) => a + Number(t.amount), 0)),
      totalExpense: Number(transactions.filter(t => t.type === 'expense').reduce((a, t) => a + Number(t.amount), 0)),
      byCategory,
      transactionCount: transactions.length,
    };
  }

  async getUpcoming(tenantId: string, days: number = 7) {
    const today = new Date();
    const future = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

    return this.prisma.financialTransaction.findMany({
      where: {
        tenantId,
        status: 'pending',
        dueDate: { gte: today, lte: future },
      },
      include: { category: true },
      orderBy: { dueDate: 'asc' },
    });
  }
}
