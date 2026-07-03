'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api-client';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { ReminderForm } from '../../components/reminders/reminder-form';
import { useToast } from '../../components/ui/toast';
import { formatDate } from '../../lib/utils';
import { Bell, Pencil, Trash2 } from 'lucide-react';
import type { Reminder } from '../../types/api';

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | undefined>(undefined);
  const { toast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    api.getReminders()
      .then(setReminders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este lembrete?')) return;
    try {
      await api.del(`/reminders/${id}`);
      toast('Lembrete excluído', 'success');
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao excluir', 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lembretes</h1>
        <Button onClick={() => { setEditingReminder(undefined); setShowForm(true); }}>Novo Lembrete</Button>
      </div>

      <Dialog open={showForm} onClose={() => { setShowForm(false); setEditingReminder(undefined); }} title={editingReminder ? 'Editar Lembrete' : 'Novo Lembrete'}>
        <ReminderForm onSuccess={() => { setShowForm(false); setEditingReminder(undefined); toast(editingReminder ? 'Lembrete atualizado!' : 'Lembrete criado!', 'success'); load(); }} onCancel={() => { setShowForm(false); setEditingReminder(undefined); }} reminder={editingReminder} />
      </Dialog>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-gray-400">Carregando...</div>
          ) : reminders.length === 0 ? (
            <div className="p-6 text-center text-gray-400">Nenhum lembrete</div>
          ) : (
            <div className="divide-y">
              {reminders.map(rem => (
                <div key={rem.id} className="flex items-center justify-between p-4 hover:bg-gray-50 group">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{rem.title}</p>
                      {rem.description && <p className="text-xs text-gray-400">{rem.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{formatDate(rem.remindAt)}</p>
                      <Badge variant={rem.isSent ? 'paid' : 'pending'}>
                        {rem.isSent ? 'Enviado' : 'Pendente'}
                      </Badge>
                    </div>
                    <button
                      onClick={() => { setEditingReminder(rem); setShowForm(true); }}
                      className="text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rem.id)}
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
