'use client';

import { useState } from 'react';
import { api } from '../../lib/api-client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface CategoryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CategoryForm({ onSuccess, onCancel }: CategoryFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense' | 'both'>('expense');
  const [color, setColor] = useState('#6366f1');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    try {
      await api.createCategory({ name, type, color } as any);
      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm text-gray-500 mb-1 block">Nome</label>
        <Input
          placeholder="Ex: Alimentação"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-sm text-gray-500 mb-1 block">Tipo</label>
        <select
          value={type}
          onChange={e => setType(e.target.value as any)}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
          <option value="both">Ambos</option>
        </select>
      </div>

      <div>
        <label className="text-sm text-gray-500 mb-1 block">Cor</label>
        <Input
          type="color"
          value={color}
          onChange={e => setColor(e.target.value)}
          className="h-10 w-20 p-1"
        />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}
