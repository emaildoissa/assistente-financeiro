'use client';

import { useState } from 'react';
import { api } from '../../lib/api-client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface ProjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProjectForm({ onSuccess, onCancel }: ProjectFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [budget, setBudget] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    try {
      await api.createProject({
        name,
        description: description || undefined,
        color,
        budget: budget ? Number(budget) : undefined,
      } as any);
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
          placeholder="Ex: Reforma escritório"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-sm text-gray-500 mb-1 block">Descrição</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="flex h-20 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
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

      <div>
        <label className="text-sm text-gray-500 mb-1 block">Orçamento</label>
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="0,00"
          value={budget}
          onChange={e => setBudget(e.target.value)}
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
