import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../../../prisma/prisma.service';

@Processor('summary')
export class SummaryProcessor {
  constructor(private prisma: PrismaService) {}

  @Process('generate-monthly')
  async generateMonthly(job: Job<{ tenantId: string; year: number; month: number }>) {
    const { tenantId, year, month } = job.data;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const transactions = await this.prisma.financialTransaction.findMany({
      where: {
        tenantId,
        transactionDate: { gte: startDate, lte: endDate },
        status: { not: 'cancelled' },
      },
      include: { category: true },
    });

    const summary = {
      period: `${year}-${String(month).padStart(2, '0')}`,
      totalIncome: Number(transactions.filter(t => t.type === 'income').reduce((a, t) => a + Number(t.amount), 0)),
      totalExpense: Number(transactions.filter(t => t.type === 'expense').reduce((a, t) => a + Number(t.amount), 0)),
      count: transactions.length,
      categories: Object.entries(
        transactions.reduce((acc, t) => {
          const cat = t.category?.name ?? 'Sem categoria';
          if (!acc[cat]) acc[cat] = { income: 0, expense: 0 };
          acc[cat][t.type] += Number(t.amount);
          return acc;
        }, {} as Record<string, { income: number; expense: number }>),
      ).map(([name, values]) => ({ name, ...values })),
    };

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        action: 'summary.generated',
        entityType: 'summary',
        newValue: summary as any,
      },
    });

    return summary;
  }
}
