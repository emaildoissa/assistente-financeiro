'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api-client';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { MessageSquare } from 'lucide-react';
import type { Conversation } from '../../../types/api';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getConversations()
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-main">Conversas WhatsApp</h1>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-text-muted">Carregando...</div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-text-muted">Nenhuma conversa</div>
          ) : (
            <div className="divide-y divide-border">
              {conversations.map(conv => (
                <div key={conv.id} className="flex items-center justify-between p-4 hover:bg-surface group transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-surface flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-text-muted" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-main">{conv.userName || conv.userPhone}</p>
                      <p className="text-xs text-text-muted mt-0.5">{conv.userPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-text-muted bg-surface px-2 py-1 rounded-full">{conv._count.messages} msgs</span>
                    <Badge variant={conv.status}>{conv.status}</Badge>
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
