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
    
    // Calcular startDate e endDate baseados no mes selecionado
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gradient tracking-wide">Transações</h1>
        <div className="flex flex-wrap items-center gap-4">
          <MonthPicker 
            month={selectedMonth} 
            year={selectedYear} 
            onChange={(m: number, y: number) => { setSelectedMonth(m); setSelectedYear(y); setPage(1); }} 
          />
          <Button onClick={openCreate} className="shadow-[0_0_15px_rgba(59,130,246,0.3)]">Nova Transação</Button>
        </div>
      </div>

      <Dialog open={showForm} onClose={() => { setShowForm(false); setEditingTransaction(undefined); }} title={editingTransaction ? 'Editar Transação' : 'Nova Transação'}>
        <TransactionForm onSuccess={handleSaved} onCancel={() => { setShowForm(false); setEditingTransaction(undefined); }} transaction={editingTransaction} />
      </Dialog>

      <div className="flex gap-2">
        {['', 'income', 'expense'].map(t => (
          <Button
            key={t}
            variant={typeFilter === t ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setTypeFilter(t); setPage(1); }}
            className={typeFilter === t ? '' : 'text-text-muted hover:text-white'}
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
            <div className="divide-y divide-white/5">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-white/5 group transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className={`h-3 w-3 rounded-full ${tx.type === 'income' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]'}`} />
                    <div>
                      <p className="text-sm font-medium text-white">{tx.description || 'Sem descrição'}</p>
                      <div className="flex gap-2 text-xs text-text-muted mt-1">
                        <span>{formatDate(tx.transactionDate)}</span>
                        {tx.category && <span className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">{tx.category.name}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right mr-2">
                      <p className={`text-sm font-bold tracking-wide ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                      </p>
                      <Badge variant={tx.status}>{tx.status}</Badge>
                    </div>
                    <button
                      onClick={() => openEdit(tx)}
                      className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-all"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all"
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
        <div className="flex justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Anterior
          </Button>
          <span className="flex items-center text-sm font-medium text-text-muted">Página <span className="text-white mx-1">{page}</span> de <span className="text-white mx-1">{totalPages}</span></span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
