'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api-client';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { TransactionForm } from '../../components/transactions/transaction-form';
import { useToast } from '../../components/ui/toast';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Trash2 } from 'lucide-react';
import type { Transaction } from '../../types/api';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: '20' };
    if (typeFilter) params.type = typeFilter;

    api.getTransactions(params)
      .then(res => {
        setTransactions(res.data);
        setTotalPages(res.pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, typeFilter]);

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

  function handleCreated() {
    setShowForm(false);
    toast('Transação registrada com sucesso!', 'success');
    setPage(1);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transações</h1>
        <Button onClick={() => setShowForm(true)}>Nova Transação</Button>
      </div>

      <Dialog open={showForm} onClose={() => setShowForm(false)} title="Nova Transação">
        <TransactionForm onSuccess={handleCreated} onCancel={() => setShowForm(false)} />
      </Dialog>

      <div className="flex gap-2">
        {['', 'income', 'expense'].map(t => (
          <Button
            key={t}
            variant={typeFilter === t ? 'default' : 'outline'}
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
            <div className="p-6 text-center text-gray-400">Carregando...</div>
          ) : transactions.length === 0 ? (
            <div className="p-6 text-center text-gray-400">Nenhuma transação</div>
          ) : (
            <div className="divide-y">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50 group">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${tx.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="text-sm font-medium">{tx.description || 'Sem descrição'}</p>
                      <div className="flex gap-2 text-xs text-gray-400">
                        <span>{formatDate(tx.transactionDate)}</span>
                        {tx.category && <span>{tx.category.name}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-sm font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                      </p>
                      <Badge variant={tx.status}>{tx.status}</Badge>
                    </div>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
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
          <span className="flex items-center text-sm text-gray-500">Página {page} de {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
