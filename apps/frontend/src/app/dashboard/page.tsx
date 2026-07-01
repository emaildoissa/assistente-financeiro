'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { api } from '../../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { BalanceChart } from '../../components/charts/balance-chart';
import { formatCurrency, formatDate } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import type { Dashboard as DashboardData } from '../../types/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg" />)}</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return null;

  const pieData = [
    { name: 'Receitas', value: data.currentMonth.income, color: '#22c55e' },
    { name: 'Despesas', value: data.currentMonth.expense, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-sm text-gray-500">Bem-vindo, {user?.name}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Saldo Total</p>
                <p className={`text-2xl font-bold ${data.balance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(data.balance.balance)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Receitas (mês)</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(data.currentMonth.income)}</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Despesas (mês)</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(data.currentMonth.expense)}</p>
              </div>
              <ArrowDownRight className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Receitas vs Despesas</CardTitle></CardHeader>
          <CardContent>
            <BalanceChart data={pieData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Próximos Vencimentos</CardTitle></CardHeader>
          <CardContent>
            {data.upcomingTransactions.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum vencimento nos próximos dias</p>
            ) : (
              <div className="space-y-3">
                {data.upcomingTransactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{tx.description || 'Sem descrição'}</p>
                      <p className="text-xs text-gray-400">Vence {formatDate(tx.dueDate!)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(Number(tx.amount))}</p>
                      <Badge variant={tx.status}>{tx.status}</Badge>
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
          <CardHeader><CardTitle>Tarefas Pendentes</CardTitle></CardHeader>
          <CardContent>
            {data.pendingTasks.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhuma tarefa pendente</p>
            ) : (
              <div className="space-y-2">
                {data.pendingTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{task.title}</span>
                    </div>
                    <Badge variant={task.status}>{task.status.replace('_', ' ')}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Lembretes</CardTitle></CardHeader>
          <CardContent>
            {data.upcomingReminders.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum lembrete agendado</p>
            ) : (
              <div className="space-y-2">
                {data.upcomingReminders.map(rem => (
                  <div key={rem.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{rem.title}</span>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(rem.remindAt)}</span>
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
