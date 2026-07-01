import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(tenantId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [balance, monthSummary, upcomingTransactions, pendingTasks, upcomingReminders] =
      await Promise.all([
        this.getBalance(tenantId),
        this.getSummary(tenantId, startOfMonth, endOfMonth),
        this.getUpcoming(tenantId),
        this.getPendingTasks(tenantId),
        this.getUpcomingReminders(tenantId),
      ]);

    return {
      balance,
      currentMonth: monthSummary,
      upcomingTransactions,
      pendingTasks,
      upcomingReminders,
    };
  }

  private async getBalance(tenantId: string) {
    const [income, expense] = await Promise.all([
      this.prisma.financialTransaction.aggregate({
        where: { tenantId, type: 'income', status: { not: 'cancelled' } },
        _sum: { amount: true },
      }),
      this.prisma.financialTransaction.aggregate({
        where: { tenantId, type: 'expense', status: { not: 'cancelled' } },
        _sum: { amount: true },
      }),
    ]);

    return {
      income: Number(income._sum.amount ?? 0),
      expense: Number(expense._sum.amount ?? 0),
      balance: Number(income._sum.amount ?? 0) - Number(expense._sum.amount ?? 0),
    };
  }

  private async getSummary(tenantId: string, start: Date, end: Date) {
    const transactions = await this.prisma.financialTransaction.findMany({
      where: {
        tenantId,
        transactionDate: { gte: start, lte: end },
        status: { not: 'cancelled' },
      },
    });

    const totals = { income: 0, expense: 0, count: transactions.length };
    for (const tx of transactions) {
      totals[tx.type] += Number(tx.amount);
    }
    return totals;
  }

  private async getUpcoming(tenantId: string) {
    const today = new Date();
    const future = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return this.prisma.financialTransaction.findMany({
      where: {
        tenantId,
        status: 'pending',
        dueDate: { gte: today, lte: future },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
      include: { category: true },
    });
  }

  private async getPendingTasks(tenantId: string) {
    return this.prisma.task.findMany({
      where: { tenantId, status: { in: ['pending', 'in_progress'] } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  private async getUpcomingReminders(tenantId: string) {
    return this.prisma.reminder.findMany({
      where: {
        tenantId,
        remindAt: { gte: new Date() },
        isSent: false,
      },
      orderBy: { remindAt: 'asc' },
      take: 10,
    });
  }
}
