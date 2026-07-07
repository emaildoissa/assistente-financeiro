'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '../../../lib/api-client';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Dialog } from '../../../components/ui/dialog';
import { ReminderForm } from '../../../components/reminders/reminder-form';
import { useToast } from '../../../components/ui/toast';
import { formatDate } from '../../../lib/utils';
import { Bell, Pencil, Trash2 } from 'lucide-react';
import type { Reminder } from '../../../types/api';

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gradient tracking-wide">Lembretes</h1>
        <Button onClick={() => { setEditingReminder(undefined); setShowForm(true); }}>Novo Lembrete</Button>
      </div>

      <Dialog open={showForm} onClose={() => { setShowForm(false); setEditingReminder(undefined); }} title={editingReminder ? 'Editar Lembrete' : 'Novo Lembrete'}>
        <ReminderForm onSuccess={() => { setShowForm(false); setEditingReminder(undefined); toast(editingReminder ? 'Lembrete atualizado!' : 'Lembrete criado!', 'success'); load(); }} onCancel={() => { setShowForm(false); setEditingReminder(undefined); }} reminder={editingReminder} />
      </Dialog>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-text-muted">Carregando...</div>
          ) : reminders.length === 0 ? (
            <div className="p-6 text-center text-text-muted">Nenhum lembrete</div>
          ) : (
            <div className="divide-y divide-white/5">
              {reminders.map(rem => (
                <div key={rem.id} className="flex items-center justify-between p-4 hover:bg-white/5 group transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                      <Bell className="h-5 w-5 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{rem.title}</p>
                      {rem.description && <p className="text-xs text-text-muted mt-0.5">{rem.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-text-muted font-medium bg-white/5 px-2 py-1 rounded-md mb-1">{formatDate(rem.remindAt)}</p>
                      <Badge variant={rem.isSent ? 'paid' : 'pending'}>
                        {rem.isSent ? 'Enviado' : 'Pendente'}
                      </Badge>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => { setEditingReminder(rem); setShowForm(true); }}
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-all"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rem.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
