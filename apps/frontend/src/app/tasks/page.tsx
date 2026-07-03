'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api-client';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { TaskForm } from '../../components/tasks/task-form';
import { useToast } from '../../components/ui/toast';
import { formatDate } from '../../lib/utils';
import { CheckCircle2, Circle, Trash2 } from 'lucide-react';
import type { Task } from '../../types/api';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    api.getTasks()
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tarefas</h1>
        <Button onClick={() => setShowForm(true)}>Nova Tarefa</Button>
      </div>

      <Dialog open={showForm} onClose={() => setShowForm(false)} title="Nova Tarefa">
        <TaskForm onSuccess={() => { setShowForm(false); toast('Tarefa criada!', 'success'); load(); }} onCancel={() => setShowForm(false)} />
      </Dialog>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-gray-400">Carregando...</div>
          ) : tasks.length === 0 ? (
            <div className="p-6 text-center text-gray-400">Nenhuma tarefa</div>
          ) : (
            <div className="divide-y">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 hover:bg-gray-50 group">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleStatus(task)}>
                      {task.status === 'done'
                        ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                        : <Circle className="h-5 w-5 text-gray-300" />
                      }
                    </button>
                    <div>
                      <p className={`text-sm ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
                        {task.title}
                      </p>
                      {task.dueDate && (
                        <p className="text-xs text-gray-400">Vence: {formatDate(task.dueDate)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={task.status}>{task.status.replace('_', ' ')}</Badge>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Excluir"
                    >
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
  );
}
