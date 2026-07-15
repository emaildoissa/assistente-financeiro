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

    const params: Record<string, string> = { 
      page: String(page), 
      limit: '20',
      startDate,
      endDate
    };
    if (typeFilter) params.type = typeFilter;

    api.getTransactions(params)
      .then(res => {
        setTransactions(res.data);
        setTotalPages(res.pages);
      })
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

  function openCreate() {
    setEditingTransaction(undefined);
    setShowForm(true);
  }

  function openEdit(tx: Transaction) {
    setEditingTransaction(tx);
    setShowForm(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text-main">Transações</h1>
        <div className="flex flex-wrap items-center gap-3">
          <MonthPicker 
            month={selectedMonth} 
            year={selectedYear} 
            onChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); setPage(1); }} 
          />
          <Button onClick={openCreate}>Nova Transação</Button>
        </div>
      </div>

      <Dialog open={showForm} onClose={() => { setShowForm(false); setEditingTransaction(undefined); }} title={editingTransaction ? 'Editar Transação' : 'Nova Transação'}>
        <TransactionForm onSuccess={handleSaved} onCancel={() => { setShowForm(false); setEditingTransaction(undefined); }} transaction={editingTransaction} />
      </Dialog>

      <div className="flex gap-2">
        {['', 'income', 'expense'].map(t => (
          <Button
            key={t}
            variant={typeFilter === t ? 'default' : 'ghost'}
            size="sm"
            onClick={() => { setTypeFilter(t); setPage(1); }}
          >
            {t === '' ? 'Todas' : t === 'income' ? 'Receitas' : 'Despesas'}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-text-muted">Carregando...</div>
          ) : transactions.length === 0 ? (
            <div className="p-6 text-center text-text-muted">Nenhuma transação</div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-surface group transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: tx.type === 'income' ? '#2BA640' : '#FF0000' }} />
                    <div>
                      <p className="text-sm font-medium text-text-main">{tx.description || 'Sem descrição'}</p>
                      <div className="flex gap-2 text-xs text-text-muted mt-0.5">
                        <span>{formatDate(tx.transactionDate)}</span>
                        {tx.category && <span className="bg-surface border border-border px-1.5 py-0.5 rounded-sm">{tx.category.name}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-1">
                      <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-success' : 'text-error'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                      </p>
                      <Badge variant={tx.status}>{tx.status}</Badge>
                    </div>
                    <button
                      onClick={() => openEdit(tx)}
                      className="p-2 rounded-full bg-surface text-text-muted hover:bg-surface-hover hover:text-text-main opacity-0 group-hover:opacity-100 transition-all"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="p-2 rounded-full bg-surface text-text-muted hover:bg-red-50 hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Anterior
          </Button>
          <span className="flex items-center text-sm text-text-muted px-2">Página {page} de {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
