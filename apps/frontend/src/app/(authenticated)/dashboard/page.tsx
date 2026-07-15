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

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-surface rounded-xl" />)}</div>;
  if (error) return <div className="text-error">{error}</div>;
  if (!data) return null;

  const pieData = [
    { name: 'Receitas', value: data.currentMonth.income, color: '#2BA640' },
    { name: 'Despesas', value: data.currentMonth.expense, color: '#FF0000' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Dashboard</h1>
          <p className="text-sm text-text-muted mt-0.5">Bem-vindo de volta, <span className="text-text-main font-medium">{user?.name}</span></p>
        </div>
        <MonthPicker 
          month={selectedMonth} 
          year={selectedYear} 
          onChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Saldo Total</p>
                <p className={`text-2xl font-bold tracking-tight ${data.balance.balance >= 0 ? 'text-text-main' : 'text-error'}`}>
                  {formatCurrency(data.balance.balance)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-surface">
                <DollarSign className="h-6 w-6 text-text-muted" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Receitas (mês)</p>
                <p className="text-2xl font-bold tracking-tight text-success">
                  {formatCurrency(data.currentMonth.income)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <ArrowUpRight className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Despesas (mês)</p>
                <p className="text-2xl font-bold tracking-tight text-error">
                  {formatCurrency(data.currentMonth.expense)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-50">
                <ArrowDownRight className="h-6 w-6 text-error" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <BalanceChart data={pieData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Vencimentos</CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-12 w-12 rounded-full bg-surface flex items-center justify-center mb-3">
                  <Calendar className="h-5 w-5 text-text-muted" />
                </div>
                <p className="text-sm text-text-muted">Nenhum vencimento nos próximos dias</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.upcomingTransactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-red-50 flex items-center justify-center">
                         <DollarSign className="h-4 w-4 text-error" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-main">{tx.description || 'Sem descrição'}</p>
                        <p className="text-xs text-text-muted mt-0.5">Vence {formatDate(tx.dueDate!)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-text-main">{formatCurrency(Number(tx.amount))}</p>
                      <span className="inline-flex mt-1 items-center rounded-sm bg-yellow-50 px-1.5 py-0.5 text-xs font-medium text-warning ring-1 ring-inset ring-warning/20">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tarefas Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            {data.pendingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-sm text-text-muted">Nenhuma tarefa pendente</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.pendingTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-surface-hover transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-secondary" />
                      </div>
                      <span className="text-sm text-text-main font-medium">{task.title}</span>
                    </div>
                    <span className="inline-flex items-center rounded-sm bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-secondary ring-1 ring-inset ring-secondary/20">
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lembretes</CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingReminders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-sm text-text-muted">Nenhum lembrete agendado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.upcomingReminders.map(rem => (
                  <div key={rem.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-surface flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-text-muted" />
                      </div>
                      <span className="text-sm text-text-main font-medium">{rem.title}</span>
                    </div>
                    <span className="text-xs text-text-muted bg-surface px-2 py-1 rounded-full">{formatDate(rem.remindAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
