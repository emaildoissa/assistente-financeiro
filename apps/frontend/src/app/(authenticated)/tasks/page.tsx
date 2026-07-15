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
      <div className="flex items-center justify-between animate-fade-up" style={{ animationDelay: '0s' }}>
        <h1 className="font-display text-2xl font-bold text-text-main">Tarefas</h1>
        <Button onClick={() => { setEditingTask(undefined); setShowForm(true); }}>Nova Tarefa</Button>
      </div>

      <Dialog open={showForm} onClose={() => { setShowForm(false); setEditingTask(undefined); }} title={editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}>
        <TaskForm onSuccess={() => { setShowForm(false); setEditingTask(undefined); toast(editingTask ? 'Tarefa atualizada!' : 'Tarefa criada!', 'success'); load(); }} onCancel={() => { setShowForm(false); setEditingTask(undefined); }} task={editingTask} />
      </Dialog>

      <div className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-center text-text-muted">Carregando...</div>
            ) : tasks.length === 0 ? (
              <div className="p-6 text-center text-text-muted">Nenhuma tarefa</div>
            ) : (
              <div className="divide-y divide-border-light">
                {tasks.map((task, i) => (
                  <div key={task.id} className="flex items-center justify-between p-4 hover:bg-surface-hover group transition-colors animate-fade-up" style={{ animationDelay: `${0.05 + i * 0.03}s` }}>
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleStatus(task)} className="transition-transform hover:scale-110 shrink-0">
                        {task.status === 'done'
                          ? <CheckCircle2 className="h-5 w-5 text-success" />
                          : <Circle className="h-5 w-5 text-text-muted hover:text-text-main transition-colors" />
                        }
                      </button>
                      <div>
                        <p className={`text-sm font-sans font-medium ${task.status === 'done' ? 'line-through text-text-muted' : 'text-text-main'}`}>{task.title}</p>
                        {task.dueDate && <p className="text-xs text-text-muted mt-0.5">Vence: {formatDate(task.dueDate)}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={task.status}>{task.status.replace('_', ' ')}</Badge>
                      <button onClick={() => { setEditingTask(task); setShowForm(true); }} className="p-2 rounded-xl bg-surface-hover text-text-muted hover:bg-white hover:text-text-main opacity-0 group-hover:opacity-100 transition-all" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(task.id)} className="p-2 rounded-xl bg-surface-hover text-text-muted hover:bg-red-50 hover:text-error opacity-0 group-hover:opacity-100 transition-all" title="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
