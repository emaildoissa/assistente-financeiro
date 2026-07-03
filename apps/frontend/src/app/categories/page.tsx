'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api-client';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { CategoryForm } from '../../components/categories/category-form';
import { useToast } from '../../components/ui/toast';
import { Trash2 } from 'lucide-react';
import type { Category } from '../../types/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    api.getCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      await api.del(`/categories/${id}`);
      toast('Categoria excluída', 'success');
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao excluir', 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <Button onClick={() => setShowForm(true)}>Nova Categoria</Button>
      </div>

      <Dialog open={showForm} onClose={() => setShowForm(false)} title="Nova Categoria">
        <CategoryForm onSuccess={() => { setShowForm(false); toast('Categoria criada!', 'success'); load(); }} onCancel={() => setShowForm(false)} />
      </Dialog>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-gray-400">Carregando...</div>
          ) : categories.length === 0 ? (
            <div className="p-6 text-center text-gray-400">Nenhuma categoria</div>
          ) : (
            <div className="divide-y">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-4 hover:bg-gray-50 group">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color || '#ccc' }} />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={cat.type === 'income' ? 'income' : cat.type === 'expense' ? 'expense' : 'default'}>
                      {cat.type === 'income' ? 'Receita' : cat.type === 'expense' ? 'Despesa' : 'Ambos'}
                    </Badge>
                    <button
                      onClick={() => handleDelete(cat.id)}
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
