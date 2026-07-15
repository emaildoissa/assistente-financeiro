'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { BalanceChart } from '../../../components/charts/balance-chart';
import { MonthPicker } from '../../../components/ui/month-picker';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import type { Dashboard as DashboardData } from '../../../types/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    api.getDashboard({ month: selectedMonth, year: selectedYear })
      .then(setData)
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedMonth, selectedYear]);

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-surface-hover rounded-2xl" />)}</div>;
  if (error) return <div className="text-error">{error}</div>;
  if (!data) return null;

  const pieData = [
    { name: 'Receitas', value: data.currentMonth.income, color: '#4A8C5C' },
    { name: 'Despesas', value: data.currentMonth.expense, color: '#C14A3A' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-up" style={{ animationDelay: '0s' }}>
        <div>
          <h1 className="font-display text-2xl font-bold text-text-main">Dashboard</h1>
          <p className="text-sm text-text-muted mt-0.5">Bem-vindo de volta, <span className="text-text-main font-medium">{user?.name}</span></p>
        </div>
        <MonthPicker
          month={selectedMonth}
          year={selectedYear}
          onChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Saldo Total', value: data.balance.balance, icon: DollarSign, color: data.balance.balance >= 0 ? 'text-text-main' : 'text-error', delay: 0.05 },
          { title: 'Receitas (mês)', value: data.currentMonth.income, icon: ArrowUpRight, color: 'text-success', delay: 0.1 },
          { title: 'Despesas (mês)', value: data.currentMonth.expense, icon: ArrowDownRight, color: 'text-error', delay: 0.15 },
        ].map((stat, i) => (
          <div key={stat.title} className="animate-fade-up" style={{ animationDelay: `${stat.delay}s` }}>
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-sans font-medium text-text-muted uppercase tracking-wider mb-1">{stat.title}</p>
                    <p className={`font-display text-2xl font-bold tracking-tight ${stat.color}`}>
                      {formatCurrency(Number(stat.value))}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-hover">
                    <stat.icon className="h-5 w-5 text-text-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { title: 'Receitas vs Despesas', content: <BalanceChart data={pieData} />, delay: 0.2 },
          {
            title: 'Próximos Vencimentos',
            empty: 'Nenhum vencimento nos próximos dias',
            emptyIcon: Calendar,
            items: data.upcomingTransactions.slice(0, 5),
            render: (tx: any) => (
              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-red-50 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-error" />
                  </div>
                  <div>
                    <p className="text-sm font-sans font-medium text-text-main">{tx.description || 'Sem descrição'}</p>
                    <p className="text-xs text-text-muted mt-0.5">Vence {formatDate(tx.dueDate)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-text-main">{formatCurrency(Number(tx.amount))}</p>
                  <Badge variant={tx.status}>{tx.status}</Badge>
                </div>
              </div>
            ),
            delay: 0.25
          },
        ].map((section, i) => (
          <div key={section.title} className="animate-fade-up" style={{ animationDelay: `${section.delay}s` }}>
            <Card>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {section.content ? section.content : (section as any).items?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="h-12 w-12 rounded-xl bg-surface-hover flex items-center justify-center mb-3">
                      {(section as any).emptyIcon && <Calendar className="h-5 w-5 text-text-muted" />}
                    </div>
                    <p className="text-sm text-text-muted">{section.empty}</p>
                  </div>
                ) : (
                  <div className="space-y-2">{(section as any).items?.map((item: any) => (section as any).render(item))}</div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          {
            title: 'Tarefas Pendentes',
            items: data.pendingTasks,
            empty: 'Nenhuma tarefa pendente',
            render: (task: any) => (
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-hover hover:bg-surface-hover/80 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-sans text-text-main font-medium">{task.title}</span>
                </div>
                <span className="inline-flex items-center rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{task.status.replace('_', ' ')}</span>
              </div>
            ),
            delay: 0.3
          },
          {
            title: 'Lembretes',
            items: data.upcomingReminders,
            empty: 'Nenhum lembrete agendado',
            render: (rem: any) => (
              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-surface-hover flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-text-muted" />
                  </div>
                  <span className="text-sm font-sans text-text-main font-medium">{rem.title}</span>
                </div>
                <span className="text-xs text-text-muted bg-surface-hover px-2 py-1 rounded-lg">{formatDate(rem.remindAt)}</span>
              </div>
            ),
            delay: 0.35
          },
        ].map((section, i) => (
          <div key={section.title} className="animate-fade-up" style={{ animationDelay: `${section.delay}s` }}>
            <Card>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {section.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <p className="text-sm text-text-muted">{section.empty}</p>
                  </div>
                ) : (
                  <div className="space-y-2">{section.items.map((item: any) => section.render(item))}</div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
