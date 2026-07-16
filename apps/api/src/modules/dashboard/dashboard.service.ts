import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(tenantId: string, month?: number, year?: number) {
    const now = new Date();
    const targetYear = year ?? now.getFullYear();
    const targetMonth = month !== undefined ? month : now.getMonth();
    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0);
    
    // Balance should probably just reflect total balance up to this point or always total. 
    // Usually balance is all-time. We'll leave getBalance as is (it doesn't filter by date currently)
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
      include: { category: true },
    });

    const totals = { income: 0, expense: 0, count: transactions.length };
    const byCategory: Record<string, number> = {};

    for (const tx of transactions) {
      const amount = Number(tx.amount);
      totals[tx.type] += amount;
      
      if (tx.type === 'expense') {
        const catName = tx.category?.name || 'Outros';
        byCategory[catName] = (byCategory[catName] || 0) + amount;
      }
    }

    const byCategoryArray = Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { ...totals, byCategory: byCategoryArray };
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
