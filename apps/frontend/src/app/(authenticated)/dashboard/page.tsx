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

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg" />)}</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return null;

  const pieData = [
    { name: 'Receitas', value: data.currentMonth.income, color: '#22c55e' },
    { name: 'Despesas', value: data.currentMonth.expense, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Dashboard</h1>
          <p className="text-sm text-text-muted mt-1 tracking-wide">Bem-vindo de volta, <span className="text-white font-medium">{user?.name}</span></p>
        </div>
        <MonthPicker 
          month={selectedMonth} 
          year={selectedYear} 
          onChange={(m: number, y: number) => { setSelectedMonth(m); setSelectedYear(y); }} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted uppercase tracking-wider mb-2">Saldo Total</p>
                <p className={`text-3xl font-bold tracking-tight ${data.balance.balance >= 0 ? 'text-white' : 'text-red-400'}`}>
                  {formatCurrency(data.balance.balance)}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <DollarSign className="h-8 w-8 text-blue-400 drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted uppercase tracking-wider mb-2">Receitas (mês)</p>
                <p className="text-3xl font-bold tracking-tight text-green-400">
                  {formatCurrency(data.currentMonth.income)}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <ArrowUpRight className="h-8 w-8 text-green-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted uppercase tracking-wider mb-2">Despesas (mês)</p>
                <p className="text-3xl font-bold tracking-tight text-red-400">
                  {formatCurrency(data.currentMonth.expense)}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <ArrowDownRight className="h-8 w-8 text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-white/90">Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <div className="w-full min-h-[300px] p-4 rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)_inset]">
              <BalanceChart data={pieData} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white/90">Próximos Vencimentos</CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-3 border border-white/10">
                  <Calendar className="h-5 w-5 text-text-muted" />
                </div>
                <p className="text-sm text-text-muted">Nenhum vencimento nos próximos dias</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.upcomingTransactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                         <DollarSign className="h-5 w-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{tx.description || 'Sem descrição'}</p>
                        <p className="text-xs text-text-muted mt-0.5">Vence {formatDate(tx.dueDate!)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white tracking-wide">{formatCurrency(Number(tx.amount))}</p>
                      <span className="inline-flex mt-1 items-center rounded-md bg-yellow-400/10 px-2 py-1 text-xs font-medium text-yellow-400 ring-1 ring-inset ring-yellow-400/20">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-white/90">Tarefas Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            {data.pendingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-sm text-text-muted">Nenhuma tarefa pendente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.pendingTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                      </div>
                      <span className="text-sm text-white font-medium">{task.title}</span>
                    </div>
                    <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/20">
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
            <CardTitle className="text-white/90">Lembretes</CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingReminders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-sm text-text-muted">Nenhum lembrete agendado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.upcomingReminders.map(rem => (
                  <div key={rem.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group border border-transparent hover:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Calendar className="h-4 w-4 text-purple-400" />
                      </div>
                      <span className="text-sm text-white font-medium">{rem.title}</span>
                    </div>
                    <span className="text-xs text-text-muted font-medium bg-black/20 px-2 py-1 rounded-md">{formatDate(rem.remindAt)}</span>
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
