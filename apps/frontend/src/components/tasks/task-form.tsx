'use client';

import { useState, useEffect } from 'react';
import { api } from '../../lib/api-client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { Project, Task } from '../../types/api';

interface TaskFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  task?: Task;
}

export function TaskForm({ onSuccess, onCancel, task }: TaskFormProps) {
  const isEdit = !!task;
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>((task?.priority as any) || 'medium');
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.slice(0, 10) : '');
  const [projectId, setProjectId] = useState(task?.project?.id || '');
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
      const body = {
        title,
        description: description || undefined,
        priority,
        dueDate: dueDate || undefined,
        projectId: projectId || undefined,
      };
      if (isEdit) {
        await api.updateTask(task!.id, body);
      } else {
        await api.createTask(body as any);
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
      <div>
        <label className="text-sm text-text-muted mb-1 block">Título</label>
        <Input
          placeholder="Ex: Revisar relatório"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-sm text-text-muted mb-1 block">Descrição</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="flex h-20 w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="text-sm text-text-muted mb-1 block">Prioridade</label>
        <select
          value={priority}
          onChange={e => setPriority(e.target.value as any)}
          className="flex h-10 w-full rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>
      </div>

      <div>
        <label className="text-sm text-text-muted mb-1 block">Projeto (opcional)</label>
        <select
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
          className="flex h-10 w-full rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Nenhum</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm text-text-muted mb-1 block">Data de vencimento</label>
        <Input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
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
