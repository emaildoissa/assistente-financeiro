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
    api.getProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-main">Projetos</h1>
        <Button onClick={() => { setEditingProject(undefined); setShowForm(true); }}>Novo Projeto</Button>
      </div>

      <Dialog open={showForm} onClose={() => { setShowForm(false); setEditingProject(undefined); }} title={editingProject ? 'Editar Projeto' : 'Novo Projeto'}>
        <ProjectForm onSuccess={() => { setShowForm(false); setEditingProject(undefined); toast(editingProject ? 'Projeto atualizado!' : 'Projeto criado!', 'success'); load(); }} onCancel={() => { setShowForm(false); setEditingProject(undefined); }} project={editingProject} />
      </Dialog>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-text-muted">Carregando...</div>
          ) : projects.length === 0 ? (
            <div className="p-6 text-center text-text-muted">Nenhum projeto</div>
          ) : (
            <div className="divide-y divide-border">
              {projects.map(proj => (
                <div key={proj.id} className="flex items-center justify-between p-4 hover:bg-surface group transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-surface flex items-center justify-center">
                      <FolderKanban className="h-4 w-4 text-text-muted" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-main">{proj.name}</p>
                      {proj.description && <p className="text-xs text-text-muted mt-0.5">{proj.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={proj.status || 'pending'}>{proj.status || 'pending'}</Badge>
                    <button
                      onClick={() => { setEditingProject(proj); setShowForm(true); }}
                      className="p-2 rounded-full bg-surface text-text-muted hover:bg-surface-hover hover:text-text-main opacity-0 group-hover:opacity-100 transition-all"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="p-2 rounded-full bg-surface text-text-muted hover:bg-red-50 hover:text-error opacity-0 group-hover:opacity-100 transition-all"
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
