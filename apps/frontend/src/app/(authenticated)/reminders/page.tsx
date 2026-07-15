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
    api.getReminders().then(setReminders).catch(console.error).finally(() => setLoading(false));
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-fade-up" style={{ animationDelay: '0s' }}>
        <h1 className="font-display text-2xl font-bold text-text-main">Lembretes</h1>
        <Button onClick={() => { setEditingReminder(undefined); setShowForm(true); }}>Novo Lembrete</Button>
      </div>

      <Dialog open={showForm} onClose={() => { setShowForm(false); setEditingReminder(undefined); }} title={editingReminder ? 'Editar Lembrete' : 'Novo Lembrete'}>
        <ReminderForm onSuccess={() => { setShowForm(false); setEditingReminder(undefined); toast(editingReminder ? 'Lembrete atualizado!' : 'Lembrete criado!', 'success'); load(); }} onCancel={() => { setShowForm(false); setEditingReminder(undefined); }} reminder={editingReminder} />
      </Dialog>

      <div className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-center text-text-muted">Carregando...</div>
            ) : reminders.length === 0 ? (
              <div className="p-6 text-center text-text-muted">Nenhum lembrete</div>
            ) : (
              <div className="divide-y divide-border-light">
                {reminders.map((rem, i) => (
                  <div key={rem.id} className="flex items-center justify-between p-4 hover:bg-surface-hover group transition-colors animate-fade-up" style={{ animationDelay: `${0.05 + i * 0.03}s` }}>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-surface-hover flex items-center justify-center">
                        <Bell className="h-4 w-4 text-text-muted" />
                      </div>
                      <div>
                        <p className="text-sm font-sans font-medium text-text-main">{rem.title}</p>
                        {rem.description && <p className="text-xs text-text-muted mt-0.5">{rem.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-text-muted bg-surface-hover px-2 py-1 rounded-lg mb-1">{formatDate(rem.remindAt)}</p>
                        <Badge variant={rem.isSent ? 'paid' : 'pending'}>{rem.isSent ? 'Enviado' : 'Pendente'}</Badge>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingReminder(rem); setShowForm(true); }} className="p-2 rounded-xl bg-surface-hover text-text-muted hover:bg-white hover:text-text-main opacity-0 group-hover:opacity-100 transition-all" title="Editar">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(rem.id)} className="p-2 rounded-xl bg-surface-hover text-text-muted hover:bg-red-50 hover:text-error opacity-0 group-hover:opacity-100 transition-all" title="Excluir">
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
    </div>
  );
}
