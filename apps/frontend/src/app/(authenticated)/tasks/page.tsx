'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '../../../lib/api-client';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Dialog } from '../../../components/ui/dialog';
import { TaskForm } from '../../../components/tasks/task-form';
import { useToast } from '../../../components/ui/toast';
import { formatDate } from '../../../lib/utils';
import { CheckCircle2, Circle, Pencil, Trash2 } from 'lucide-react';
import type { Task } from '../../../types/api';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const { toast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    api.getTasks().then(setTasks).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  async function toggleStatus(task: Task) {
    const newStatus = task.status === 'done' ? 'pending' : 'done';
    await api.updateTask(task.id, { status: newStatus } as any);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    try {
      await api.del(`/tasks/${id}`);
      toast('Tarefa excluída', 'success');
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao excluir', 'error');
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-up" style={{ animationDelay: '0s' }}>
        <div>
          <h1 className="font-display text-3xl font-bold text-text-main tracking-tight">Tarefas</h1>
          <p className="text-sm text-text-muted mt-1">Sua lista de pendências financeiras</p>
        </div>
        <Button onClick={() => { setEditingTask(undefined); setShowForm(true); }}>Nova Tarefa</Button>
      </div>

      <Dialog open={showForm} onClose={() => { setShowForm(false); setEditingTask(undefined); }} title={editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}>
        <TaskForm onSuccess={() => { setShowForm(false); setEditingTask(undefined); toast(editingTask ? 'Tarefa atualizada!' : 'Tarefa criada!', 'success'); load(); }} onCancel={() => { setShowForm(false); setEditingTask(undefined); }} task={editingTask} />
      </Dialog>

      <div className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
        {loading ? (
          <div className="p-8 text-center text-text-muted bg-surface rounded-3xl border border-border/50 shadow-soft">Carregando...</div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-text-muted bg-surface rounded-3xl border border-border/50 shadow-soft">Nenhuma tarefa encontrada.</div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, i) => (
              <div key={task.id} className={`flex flex-col md:flex-row md:items-center justify-between p-5 bg-surface rounded-3xl shadow-sm border border-border/40 hover:shadow-md transition-all group animate-fade-up ${task.status === 'done' ? 'opacity-75 hover:opacity-100' : ''}`} style={{ animationDelay: `${0.05 + i * 0.03}s` }}>
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleStatus(task)} className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 bg-surface-hover transition-transform duration-300 hover:scale-105">
                    {task.status === 'done'
                      ? <CheckCircle2 className="h-6 w-6 text-success" />
                      : <Circle className="h-6 w-6 text-text-muted hover:text-text-main transition-colors" />
                    }
                  </button>
                  <div>
                    <p className={`text-base font-sans font-semibold ${task.status === 'done' ? 'line-through text-text-muted' : 'text-text-main'}`}>{task.title}</p>
                    {task.dueDate && <p className="text-xs font-medium text-text-muted mt-1">Vence: {formatDate(task.dueDate)}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-4 mt-4 md:mt-0">
                  <Badge variant={task.status}>{task.status.replace('_', ' ')}</Badge>
                  <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingTask(task); setShowForm(true); }} className="p-2.5 rounded-xl bg-surface-hover text-text-muted hover:bg-white hover:text-text-main transition-colors" title="Editar">
                      <Pencil className="h-4.5 w-4.5" />
                    </button>
                    <button onClick={() => handleDelete(task.id)} className="p-2.5 rounded-xl bg-surface-hover text-text-muted hover:bg-red-50 hover:text-error transition-colors" title="Excluir">
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
