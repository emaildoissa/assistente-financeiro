'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '../../../lib/api-client';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Dialog } from '../../../components/ui/dialog';
import { ProjectForm } from '../../../components/projects/project-form';
import { useToast } from '../../../components/ui/toast';
import { Pencil, Trash2 } from 'lucide-react';
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gradient tracking-wide">Projetos</h1>
        <Button onClick={() => { setEditingProject(undefined); setShowForm(true); }}>Novo Projeto</Button>
      </div>

      <Dialog open={showForm} onClose={() => { setShowForm(false); setEditingProject(undefined); }} title={editingProject ? 'Editar Projeto' : 'Novo Projeto'}>
        <ProjectForm onSuccess={() => { setShowForm(false); setEditingProject(undefined); toast(editingProject ? 'Projeto atualizado!' : 'Projeto criado!', 'success'); load(); }} onCancel={() => { setShowForm(false); setEditingProject(undefined); }} project={editingProject} />
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-text-muted">Carregando...</div>
        ) : projects.length === 0 ? (
          <div className="col-span-full text-center text-text-muted">Nenhum projeto</div>
        ) : projects.map(project => (
          <Card key={project.id} className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <CardHeader className="flex flex-row items-center gap-3 border-b border-white/5 pb-4">
                <div className="h-4 w-4 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: project.color || '#555', boxShadow: project.color ? `0 0 12px ${project.color}80` : undefined }} />
                <CardTitle className="text-lg font-bold text-white flex-1 tracking-wide">{project.name}</CardTitle>
                <Badge variant={project.status}>{project.status}</Badge>
                <button
                  onClick={() => { setEditingProject(project); setShowForm(true); }}
                  className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-all"
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent className="pt-4">
                {project.description && (
                  <p className="text-sm text-text-muted mb-4 line-clamp-2">{project.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs font-medium text-white/60">
                  <span className="bg-white/5 px-2 py-1 rounded-md border border-white/10">{project._count?.tasks ?? 0} tarefa(s)</span>
                  {project.budget && <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded-md border border-green-500/20">Orçamento: R$ {Number(project.budget).toFixed(2)}</span>}
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
