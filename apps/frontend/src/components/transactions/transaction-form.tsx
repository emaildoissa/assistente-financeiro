'use client';

import { useState, useEffect } from 'react';
import { api } from '../../lib/api-client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { Category, Transaction } from '../../types/api';

interface TransactionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  transaction?: Transaction;
}

export function TransactionForm({ onSuccess, onCancel, transaction }: TransactionFormProps) {
  const isEdit = !!transaction;
  const [type, setType] = useState<'income' | 'expense'>((transaction?.type as any) || 'expense');
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [categoryId, setCategoryId] = useState(transaction?.category?.id || '');
  const [date, setDate] = useState(
    transaction
      ? transaction.transactionDate.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getCategories(type).then(setCategories).catch(() => {});
  }, [type]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !description) return;
    setSaving(true);
    try {
      const body = {
        type,
        amount: Number(amount),
        description,
        categoryId: categoryId || undefined,
        transactionDate: new Date(date).toISOString(),
      };
      if (isEdit) {
        await api.updateTransaction(transaction!.id, body);
      } else {
        await api.createTransaction(body);
      }
      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        {(['expense', 'income'] as const).map(t => (
          <Button
            key={t}
            type="button"
            variant={type === t ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setType(t)}
          >
            {t === 'expense' ? 'Despesa' : 'Receita'}
          </Button>
        ))}
      </div>

      <div>
        <label className="text-sm text-text-muted mb-1 block">Valor</label>
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="0,00"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-sm text-text-muted mb-1 block">Descrição</label>
        <Input
          placeholder="Ex: Almoço, Gasolina..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-sm text-text-muted mb-1 block">Categoria</label>
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          className="flex h-10 w-full rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Sem categoria</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm text-text-muted mb-1 block">Data</label>
        <Input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Salvando...' : isEdit ? 'Atualizar' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}
