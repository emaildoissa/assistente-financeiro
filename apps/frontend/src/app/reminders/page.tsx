'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api-client';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { formatDate } from '../../lib/utils';
import { Bell } from 'lucide-react';
import type { Reminder } from '../../types/api';

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getReminders()
      .then(setReminders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Lembretes</h1>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-gray-400">Carregando...</div>
          ) : reminders.length === 0 ? (
            <div className="p-6 text-center text-gray-400">Nenhum lembrete</div>
          ) : (
            <div className="divide-y">
              {reminders.map(rem => (
                <div key={rem.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{rem.title}</p>
                      {rem.description && <p className="text-xs text-gray-400">{rem.description}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{formatDate(rem.remindAt)}</p>
                    <Badge variant={rem.isSent ? 'paid' : 'pending'}>
                      {rem.isSent ? 'Enviado' : 'Pendente'}
                    </Badge>
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
