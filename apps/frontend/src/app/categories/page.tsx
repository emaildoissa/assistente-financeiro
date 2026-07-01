'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api-client';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import type { Category } from '../../types/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Categorias</h1>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-gray-400">Carregando...</div>
          ) : (
            <div className="divide-y">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color || '#ccc' }} />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                  <Badge variant={cat.type === 'income' ? 'income' : 'expense'}>
                    {cat.type === 'income' ? 'Receita' : cat.type === 'expense' ? 'Despesa' : 'Ambos'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
