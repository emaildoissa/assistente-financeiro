'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '../../../lib/api-client';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Dialog } from '../../../components/ui/dialog';
import { MonthPicker } from '../../../components/ui/month-picker';
import { TransactionForm } from '../../../components/transactions/transaction-form';
import { useToast } from '../../../components/ui/toast';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Pencil, Trash2 } from 'lucide-react';
import type { Transaction } from '../../../types/api';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { toast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    const startDate = new Date(selectedYear, selectedMonth, 1).toISOString();
    const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999).toISOString();
    const params: Record<string, string> = { page: String(page), limit: '20', startDate, endDate };
    if (typeFilter) params.type = typeFilter;
    api.getTransactions(params)
      .then(res => { setTransactions(res.data); setTotalPages(res.pages); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, typeFilter, selectedMonth, selectedYear]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
    try {
      await api.del(`/transactions/${id}`);
      toast('Transação excluída', 'success');
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao excluir', 'error');
    }
  }

  function handleSaved() {
    setShowForm(false);
    setEditingTransaction(undefined);
    toast(editingTransaction ? 'Transação atualizada!' : 'Transação registrada!', 'success');
    setPage(1);
    load();
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-up" style={{ animationDelay: '0s' }}>
        <div>
          <h1 className="font-display text-3xl font-bold text-text-main tracking-tight">Transações</h1>
          <p className="text-sm text-text-muted mt-1">Gerencie suas receitas e despesas</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <MonthPicker month={selectedMonth} year={selectedYear} onChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); setPage(1); }} />
          <Button onClick={() => { setEditingTransaction(undefined); setShowForm(true); }}>Nova Transação</Button>
        </div>
      </div>

      <Dialog open={showForm} onClose={() => { setShowForm(false); setEditingTransaction(undefined); }} title={editingTransaction ? 'Editar Transação' : 'Nova Transação'}>
        <TransactionForm onSuccess={handleSaved} onCancel={() => { setShowForm(false); setEditingTransaction(undefined); }} transaction={editingTransaction} />
      </Dialog>

      <div className="flex gap-2 animate-fade-up" style={{ animationDelay: '0.05s' }}>
        {['', 'income', 'expense'].map(t => (
          <Button key={t} variant={typeFilter === t ? 'default' : 'ghost'} size="sm" onClick={() => { setTypeFilter(t); setPage(1); }}>
            {t === '' ? 'Todas' : t === 'income' ? 'Receitas' : 'Despesas'}
          </Button>
        ))}
      </div>

      <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {loading ? (
          <div className="p-8 text-center text-text-muted bg-surface rounded-3xl border border-border/50 shadow-soft">Carregando...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-text-muted bg-surface rounded-3xl border border-border/50 shadow-soft">Nenhuma transação encontrada.</div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, i) => (
              <div key={tx.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-surface rounded-3xl shadow-sm border border-border/40 hover:shadow-md transition-all group animate-fade-up" style={{ animationDelay: `${0.1 + i * 0.03}s` }}>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105" style={{ backgroundColor: tx.type === 'income' ? '#4A8C5C15' : '#C14A3A15' }}>
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: tx.type === 'income' ? '#4A8C5C' : '#C14A3A' }} />
                  </div>
                  <div>
                    <p className="text-base font-sans font-semibold text-text-main">{tx.description || 'Sem descrição'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-text-muted">{formatDate(tx.transactionDate)}</span>
                      {tx.category && <span className="bg-surface-hover px-2 py-0.5 rounded-md text-xs font-medium text-text-muted">{tx.category.name}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-4 mt-4 md:mt-0 w-full md:w-auto">
                  <div className="text-left md:text-right">
                    <p className={`font-display text-lg font-bold ${tx.type === 'income' ? 'text-success' : 'text-error'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                    </p>
                    <Badge variant={tx.status}>{tx.status}</Badge>
                  </div>
                  <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-all">
                    <button onClick={() => { setEditingTransaction(tx); setShowForm(true); }} className="p-2.5 rounded-xl bg-surface-hover text-text-muted hover:bg-white hover:text-text-main transition-colors" title="Editar">
                      <Pencil className="h-4.5 w-4.5" />
                    </button>
                    <button onClick={() => handleDelete(tx.id)} className="p-2.5 rounded-xl bg-surface-hover text-text-muted hover:bg-red-50 hover:text-error transition-colors" title="Excluir">
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
          <span className="flex items-center text-sm text-text-muted px-2">Página {page} de {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Próxima</Button>
        </div>
      )}
    </div>
  );
}
