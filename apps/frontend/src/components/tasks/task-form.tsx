'use client';

import { useState, useEffect } from 'react';
import { api } from '../../lib/api-client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { Project } from '../../types/api';

interface TaskFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function TaskForm({ onSuccess, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getProjects().then(setProjects).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    setSaving(true);
    try {
      await api.createTask({
        title,
        description: description || undefined,
        priority,
        dueDate: dueDate || undefined,
        projectId: projectId || undefined,
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
          placeholder="Ex: Revisar relatório"
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
        <label className="text-sm text-gray-500 mb-1 block">Prioridade</label>
        <select
          value={priority}
          onChange={e => setPriority(e.target.value as any)}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>
      </div>

      <div>
        <label className="text-sm text-gray-500 mb-1 block">Projeto (opcional)</label>
        <select
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Nenhum</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm text-gray-500 mb-1 block">Data de vencimento</label>
        <Input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
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
