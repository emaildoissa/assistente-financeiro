'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '../../../lib/api-client';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Dialog } from '../../../components/ui/dialog';
import { CategoryForm } from '../../../components/categories/category-form';
import { useToast } from '../../../components/ui/toast';
import { Pencil, Trash2 } from 'lucide-react';
import type { Category } from '../../../types/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const { toast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    api.getCategories().then(setCategories).catch(console.error).finally(() => setLoading(false));
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-fade-up" style={{ animationDelay: '0s' }}>
        <h1 className="font-display text-2xl font-bold text-text-main">Categorias</h1>
        <Button onClick={() => { setEditingCategory(undefined); setShowForm(true); }}>Nova Categoria</Button>
      </div>

      <Dialog open={showForm} onClose={() => { setShowForm(false); setEditingCategory(undefined); }} title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}>
        <CategoryForm onSuccess={() => { setShowForm(false); setEditingCategory(undefined); toast(editingCategory ? 'Categoria atualizada!' : 'Categoria criada!', 'success'); load(); }} onCancel={() => { setShowForm(false); setEditingCategory(undefined); }} category={editingCategory} />
      </Dialog>

      <div className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-center text-text-muted">Carregando...</div>
            ) : categories.length === 0 ? (
              <div className="p-6 text-center text-text-muted">Nenhuma categoria</div>
            ) : (
              <div className="divide-y divide-border-light">
                {categories.map((cat, i) => (
                  <div key={cat.id} className="flex items-center justify-between p-4 hover:bg-surface-hover group transition-colors animate-fade-up" style={{ animationDelay: `${0.05 + i * 0.03}s` }}>
                    <div className="flex items-center gap-3">
                      <div className="h-3.5 w-3.5 rounded-sm shrink-0" style={{ backgroundColor: cat.color || '#999' }} />
                      <span className="text-sm font-sans font-medium text-text-main">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={cat.type === 'income' ? 'income' : cat.type === 'expense' ? 'expense' : 'income_expense'}>
                        {cat.type === 'income' ? 'Receita' : cat.type === 'expense' ? 'Despesa' : 'Ambos'}
                      </Badge>
                      <button onClick={() => { setEditingCategory(cat); setShowForm(true); }} className="p-2 rounded-xl bg-surface-hover text-text-muted hover:bg-white hover:text-text-main opacity-0 group-hover:opacity-100 transition-all" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-xl bg-surface-hover text-text-muted hover:bg-red-50 hover:text-error opacity-0 group-hover:opacity-100 transition-all" title="Excluir">
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
    </div>
  );
}
