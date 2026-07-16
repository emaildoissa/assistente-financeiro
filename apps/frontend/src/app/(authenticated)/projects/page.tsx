'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '../../../lib/api-client';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Dialog } from '../../../components/ui/dialog';
import { ProjectForm } from '../../../components/projects/project-form';
import { useToast } from '../../../components/ui/toast';
import { Pencil, Trash2, FolderKanban } from 'lucide-react';
import type { Project } from '../../../types/api';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const { toast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    api.getProjects().then(setProjects).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return;
    try {
      await api.del(`/projects/${id}`);
      toast('Projeto excluído', 'success');
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao excluir', 'error');
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-up" style={{ animationDelay: '0s' }}>
        <div>
          <h1 className="font-display text-3xl font-bold text-text-main tracking-tight">Projetos</h1>
          <p className="text-sm text-text-muted mt-1">Acompanhe suas metas financeiras</p>
        </div>
        <Button onClick={() => { setEditingProject(undefined); setShowForm(true); }}>Novo Projeto</Button>
      </div>

      <Dialog open={showForm} onClose={() => { setShowForm(false); setEditingProject(undefined); }} title={editingProject ? 'Editar Projeto' : 'Novo Projeto'}>
        <ProjectForm onSuccess={() => { setShowForm(false); setEditingProject(undefined); toast(editingProject ? 'Projeto atualizado!' : 'Projeto criado!', 'success'); load(); }} onCancel={() => { setShowForm(false); setEditingProject(undefined); }} project={editingProject} />
      </Dialog>

      <div className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
        {loading ? (
          <div className="p-8 text-center text-text-muted bg-surface rounded-3xl border border-border/50 shadow-soft">Carregando...</div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center text-text-muted bg-surface rounded-3xl border border-border/50 shadow-soft">Nenhum projeto encontrado.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((proj, i) => (
              <div key={proj.id} className="flex flex-col p-5 bg-surface rounded-3xl shadow-sm border border-border/40 hover:shadow-md transition-all group animate-fade-up" style={{ animationDelay: `${0.05 + i * 0.03}s` }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 bg-primary/10 transition-transform duration-300 group-hover:scale-105">
                    <FolderKanban className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-sans font-semibold text-text-main line-clamp-1">{proj.name}</p>
                    {proj.description && <p className="text-xs font-medium text-text-muted mt-0.5 line-clamp-1">{proj.description}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-light">
                  <Badge variant={proj.status || 'pending'}>{proj.status || 'pending'}</Badge>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingProject(proj); setShowForm(true); }} className="p-2.5 rounded-xl bg-surface-hover text-text-muted hover:bg-white hover:text-text-main transition-colors" title="Editar">
                      <Pencil className="h-4.5 w-4.5" />
                    </button>
                    <button onClick={() => handleDelete(proj.id)} className="p-2.5 rounded-xl bg-surface-hover text-text-muted hover:bg-red-50 hover:text-error transition-colors" title="Excluir">
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
