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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-up" style={{ animationDelay: '0s' }}>
        <div>
          <h1 className="font-display text-3xl font-bold text-text-main tracking-tight">Lembretes</h1>
          <p className="text-sm text-text-muted mt-1">Não esqueça seus compromissos financeiros</p>
        </div>
        <Button onClick={() => { setEditingReminder(undefined); setShowForm(true); }}>Novo Lembrete</Button>
      </div>

      <Dialog open={showForm} onClose={() => { setShowForm(false); setEditingReminder(undefined); }} title={editingReminder ? 'Editar Lembrete' : 'Novo Lembrete'}>
        <ReminderForm onSuccess={() => { setShowForm(false); setEditingReminder(undefined); toast(editingReminder ? 'Lembrete atualizado!' : 'Lembrete criado!', 'success'); load(); }} onCancel={() => { setShowForm(false); setEditingReminder(undefined); }} reminder={editingReminder} />
      </Dialog>

      <div className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
        {loading ? (
          <div className="p-8 text-center text-text-muted bg-surface rounded-3xl border border-border/50 shadow-soft">Carregando...</div>
        ) : reminders.length === 0 ? (
          <div className="p-8 text-center text-text-muted bg-surface rounded-3xl border border-border/50 shadow-soft">Nenhum lembrete encontrado.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reminders.map((rem, i) => (
              <div key={rem.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-surface rounded-3xl shadow-sm border border-border/40 hover:shadow-md transition-all group animate-fade-up" style={{ animationDelay: `${0.05 + i * 0.03}s` }}>
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 bg-primary/10 transition-transform duration-300 group-hover:scale-105">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-sans font-semibold text-text-main">{rem.title}</p>
                    {rem.description && <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{rem.description}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 sm:gap-2">
                  <div className="text-left sm:text-right flex items-center sm:block gap-2">
                    <p className="text-xs font-medium text-text-main bg-surface-hover px-2.5 py-1 rounded-lg sm:mb-1">{formatDate(rem.remindAt)}</p>
                    <Badge variant={rem.isSent ? 'paid' : 'pending'}>{rem.isSent ? 'Enviado' : 'Pendente'}</Badge>
                  </div>
                  <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingReminder(rem); setShowForm(true); }} className="p-2.5 rounded-xl bg-surface-hover text-text-muted hover:bg-white hover:text-text-main transition-colors" title="Editar">
                      <Pencil className="h-4.5 w-4.5" />
                    </button>
                    <button onClick={() => handleDelete(rem.id)} className="p-2.5 rounded-xl bg-surface-hover text-text-muted hover:bg-red-50 hover:text-error transition-colors" title="Excluir">
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
