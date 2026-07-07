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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-3xl font-bold text-gradient tracking-wide">Conversas WhatsApp</h1>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-text-muted">Carregando...</div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-text-muted">Nenhuma conversa</div>
          ) : (
            <div className="divide-y divide-white/5">
              {conversations.map(conv => (
                <div key={conv.id} className="flex items-center justify-between p-4 hover:bg-white/5 group transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                      <MessageSquare className="h-5 w-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{conv.userName || conv.userPhone}</p>
                      <p className="text-xs text-text-muted mt-0.5">{conv.userPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-white bg-white/5 px-2 py-1 rounded-md border border-white/10">{conv._count.messages} msgs</span>
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
