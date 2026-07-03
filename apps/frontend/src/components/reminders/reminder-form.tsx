'use client';

import { useState } from 'react';
import { api } from '../../lib/api-client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface ReminderFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReminderForm({ onSuccess, onCancel }: ReminderFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [remindAt, setRemindAt] = useState('');
  const [remindTime, setRemindTime] = useState('09:00');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !remindAt) return;
    setSaving(true);
    try {
      const remindAtISO = new Date(`${remindAt}T${remindTime}:00`).toISOString();
      await api.createReminder({
        title,
        description: description || undefined,
        remindAt: remindAtISO,
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
        <label className="text-sm text-gray-500 mb-1 block">Título</label>
        <Input
          placeholder="Ex: Pagar conta de luz"
          value={title}
          onChange={e => setTitle(e.target.value)}
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
        <label className="text-sm text-gray-500 mb-1 block">Data</label>
        <Input
          type="date"
          value={remindAt}
          onChange={e => setRemindAt(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-sm text-gray-500 mb-1 block">Horário</label>
        <Input
          type="time"
          value={remindTime}
          onChange={e => setRemindTime(e.target.value)}
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
