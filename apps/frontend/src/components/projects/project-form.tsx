'use client';

import { useState } from 'react';
import { api } from '../../lib/api-client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { Project } from '../../types/api';

interface ProjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  project?: Project;
}

export function ProjectForm({ onSuccess, onCancel, project }: ProjectFormProps) {
  const isEdit = !!project;
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [color, setColor] = useState(project?.color || '#C66B3D');
  const [budget, setBudget] = useState(project?.budget ? String(project.budget) : '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    try {
      const body = { name, description: description || undefined, color, budget: budget ? Number(budget) : undefined };
      if (isEdit) await api.updateProject(project!.id, body);
      else await api.createProject(body as any);
      onSuccess();
    } catch (err) { alert(err instanceof Error ? err.message : 'Erro ao salvar'); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-sans font-medium text-text-main mb-1 block">Nome</label>
        <Input placeholder="Ex: Reforma escritório" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-sans font-medium text-text-main mb-1 block">Descrição</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="flex h-20 w-full rounded-xl border border-border bg-surface-hover px-4 py-2 text-sm text-text-main placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>
      <div>
        <label className="text-sm font-sans font-medium text-text-main mb-1 block">Cor</label>
        <Input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10 w-20 p-1 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-lg" />
      </div>
      <div>
        <label className="text-sm font-sans font-medium text-text-main mb-1 block">Orçamento</label>
        <Input type="number" step="0.01" min="0" placeholder="0,00" value={budget} onChange={e => setBudget(e.target.value)} />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : isEdit ? 'Atualizar' : 'Salvar'}</Button>
      </div>
    </form>
  );
}
