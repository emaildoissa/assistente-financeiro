'use client';

import { useState } from 'react';
import { api } from '../../lib/api-client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { Category } from '../../types/api';

interface CategoryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  category?: Category;
}

export function CategoryForm({ onSuccess, onCancel, category }: CategoryFormProps) {
  const isEdit = !!category;
  const [name, setName] = useState(category?.name || '');
  const [type, setType] = useState<'income' | 'expense' | 'both'>((category?.type as any) || 'expense');
  const [color, setColor] = useState(category?.color || '#C66B3D');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    try {
      const body = { name, type, color };
      if (isEdit) await api.updateCategory(category!.id, body);
      else await api.createCategory(body as any);
      onSuccess();
    } catch (err) { alert(err instanceof Error ? err.message : 'Erro ao salvar'); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-sans font-medium text-text-main mb-1 block">Nome</label>
        <Input placeholder="Ex: Alimentação" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-sans font-medium text-text-main mb-1 block">Tipo</label>
        <select value={type} onChange={e => setType(e.target.value as any)} className="flex h-10 w-full rounded-xl border border-border bg-surface-hover px-4 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
          <option value="both">Ambos</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-sans font-medium text-text-main mb-1 block">Cor</label>
        <Input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10 w-20 p-1 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-lg" />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : isEdit ? 'Atualizar' : 'Salvar'}</Button>
      </div>
    </form>
  );
}
