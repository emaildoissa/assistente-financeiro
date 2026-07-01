'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api-client';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { formatDate } from '../../lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';
import type { Task } from '../../types/api';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.getTasks()
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function toggleStatus(task: Task) {
    const newStatus = task.status === 'done' ? 'pending' : 'done';
    await api.updateTask(task.id, { status: newStatus } as any);
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tarefas</h1>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-gray-400">Carregando...</div>
          ) : tasks.length === 0 ? (
            <div className="p-6 text-center text-gray-400">Nenhuma tarefa</div>
          ) : (
            <div className="divide-y">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
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
                  <Badge variant={task.status}>{task.status.replace('_', ' ')}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
