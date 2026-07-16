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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-up" style={{ animationDelay: '0s' }}>
        <div>
          <h1 className="font-display text-3xl font-bold text-text-main tracking-tight">Categorias</h1>
          <p className="text-sm text-text-muted mt-1">Organize suas finanças</p>
        </div>
        <Button onClick={() => { setEditingCategory(undefined); setShowForm(true); }}>Nova Categoria</Button>
      </div>

      <Dialog open={showForm} onClose={() => { setShowForm(false); setEditingCategory(undefined); }} title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}>
        <CategoryForm onSuccess={() => { setShowForm(false); setEditingCategory(undefined); toast(editingCategory ? 'Categoria atualizada!' : 'Categoria criada!', 'success'); load(); }} onCancel={() => { setShowForm(false); setEditingCategory(undefined); }} category={editingCategory} />
      </Dialog>

      <div className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
        {loading ? (
          <div className="p-8 text-center text-text-muted bg-surface rounded-3xl border border-border/50 shadow-soft">Carregando...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-text-muted bg-surface rounded-3xl border border-border/50 shadow-soft">Nenhuma categoria</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <div key={cat.id} className="flex flex-col p-5 bg-surface rounded-3xl shadow-sm border border-border/40 hover:shadow-md transition-all group animate-fade-up" style={{ animationDelay: `${0.05 + i * 0.03}s` }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105" style={{ backgroundColor: (cat.color || '#999') + '20' }}>
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: cat.color || '#999' }} />
                  </div>
                  <span className="text-lg font-sans font-semibold text-text-main">{cat.name}</span>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <Badge variant={cat.type === 'income' ? 'income' : cat.type === 'expense' ? 'expense' : 'income_expense'}>
                    {cat.type === 'income' ? 'Receita' : cat.type === 'expense' ? 'Despesa' : 'Ambos'}
                  </Badge>
                  <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingCategory(cat); setShowForm(true); }} className="p-2.5 rounded-xl bg-surface-hover text-text-muted hover:bg-white hover:text-text-main transition-colors" title="Editar">
                      <Pencil className="h-4.5 w-4.5" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2.5 rounded-xl bg-surface-hover text-text-muted hover:bg-red-50 hover:text-error transition-colors" title="Excluir">
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
