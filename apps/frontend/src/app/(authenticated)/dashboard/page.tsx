'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { BalanceChart } from '../../../components/charts/balance-chart';
import { MonthPicker } from '../../../components/ui/month-picker';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { ArrowUpRight, ArrowDownRight, ShoppingCart, Utensils, Bus, Home, Coffee, Receipt } from 'lucide-react';
import type { Dashboard as DashboardData } from '../../../types/api';

const COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4'];

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('alimentaç') || n.includes('mercado') || n.includes('comida') || n.includes('restaurante')) return <Utensils className="h-5 w-5 text-orange-500" />;
  if (n.includes('transporte') || n.includes('uber') || n.includes('ônibus') || n.includes('gasolina')) return <Bus className="h-5 w-5 text-blue-500" />;
  if (n.includes('moradia') || n.includes('casa') || n.includes('luz') || n.includes('água')) return <Home className="h-5 w-5 text-indigo-500" />;
  if (n.includes('café') || n.includes('lanche')) return <Coffee className="h-5 w-5 text-amber-600" />;
  if (n.includes('compras') || n.includes('shopping') || n.includes('roupa')) return <ShoppingCart className="h-5 w-5 text-pink-500" />;
  return <Receipt className="h-5 w-5 text-gray-400" />;
};

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

  if (loading) return <div className="animate-pulse space-y-4 max-w-4xl mx-auto">{[1,2,3].map(i => <div key={i} className="h-32 bg-surface-hover rounded-3xl" />)}</div>;
  if (error) return <div className="text-error text-center mt-10">{error}</div>;
  if (!data) return null;

  // Montar dados da Rosca (Despesas por Categoria)
  const categoryData = (data.currentMonth.byCategory || []).map((cat, idx) => ({
    name: cat.name,
    value: cat.value,
    color: COLORS[idx % COLORS.length]
  }));

  // Se não houver despesas categorizadas, exibe um gráfico genérico
  const pieData = categoryData.length > 0 ? categoryData : [
    { name: 'Nenhuma despesa', value: 1, color: '#f3f4f6' }
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-10">
      {/* Header & Month Picker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-up" style={{ animationDelay: '0s' }}>
        <div>
          <h1 className="font-display text-3xl font-bold text-text-main tracking-tight">Panorama</h1>
          <p className="text-sm text-text-muted mt-1">Como estão seus gastos neste mês?</p>
        </div>
        <MonthPicker
          month={selectedMonth}
          year={selectedYear}
          onChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}
        />
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="col-span-2 md:col-span-1 border-none shadow-soft bg-gradient-to-br from-surface to-surface-hover">
          <CardContent className="pt-6">
            <p className="text-sm font-sans font-medium text-text-muted mb-2">Saldo Geral</p>
            <p className={`font-display text-3xl font-bold tracking-tight ${data.balance.balance >= 0 ? 'text-text-main' : 'text-error'}`}>
              {formatCurrency(Number(data.balance.balance))}
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-soft">
          <CardContent className="pt-6 flex flex-col h-full justify-between">
            <div className="flex items-center gap-2 text-success mb-2">
              <div className="bg-success/10 p-1.5 rounded-md"><ArrowUpRight className="h-4 w-4" /></div>
              <span className="text-sm font-medium">Receitas</span>
            </div>
            <p className="font-display text-xl font-bold">{formatCurrency(Number(data.currentMonth.income))}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-soft">
          <CardContent className="pt-6 flex flex-col h-full justify-between">
            <div className="flex items-center gap-2 text-error mb-2">
              <div className="bg-error/10 p-1.5 rounded-md"><ArrowDownRight className="h-4 w-4" /></div>
              <span className="text-sm font-medium">Despesas</span>
            </div>
            <p className="font-display text-xl font-bold">{formatCurrency(Number(data.currentMonth.expense))}</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção Gráfico e Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        
        {/* Gráfico de Rosca */}
        <div className="animate-fade-up bg-surface border border-border/50 rounded-3xl p-6 shadow-soft flex flex-col" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg text-center font-display font-semibold text-text-main mb-2">Despesas por Categoria</h2>
          <div className="flex-1 flex items-center justify-center -mt-2 min-h-[250px]">
            <BalanceChart data={pieData} />
          </div>
        </div>

        {/* Lista de Categorias no estilo Receiptix */}
        <div className="animate-fade-up space-y-3" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-display font-semibold text-lg text-text-main px-1 mb-4">Detalhamento</h3>
          {categoryData.length === 0 ? (
             <div className="text-center p-8 text-text-muted bg-surface rounded-3xl border border-border/50">Nenhuma despesa registrada neste mês.</div>
          ) : (
            categoryData.map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between p-4 bg-surface rounded-3xl shadow-sm border border-border/40 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-surface-hover group-hover:scale-105 transition-transform duration-300">
                    {getCategoryIcon(cat.name)}
                  </div>
                  <div>
                    <p className="font-sans font-semibold text-text-main text-base">{cat.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{((cat.value / (data.currentMonth.expense || 1)) * 100).toFixed(0)}% das despesas</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span className="font-display font-bold text-text-main">{formatCurrency(cat.value)}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary/50 transition-colors"></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
