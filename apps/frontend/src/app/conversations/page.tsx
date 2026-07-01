'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api-client';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { MessageSquare } from 'lucide-react';
import type { Conversation } from '../../types/api';

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
      <h1 className="text-2xl font-bold">Conversas WhatsApp</h1>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-gray-400">Carregando...</div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-400">Nenhuma conversa</div>
          ) : (
            <div className="divide-y">
              {conversations.map(conv => (
                <div key={conv.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{conv.userName || conv.userPhone}</p>
                      <p className="text-xs text-gray-400">{conv.userPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{conv._count.messages} msgs</span>
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
