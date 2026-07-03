'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api-client';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { ProjectForm } from '../../components/projects/project-form';
import { useToast } from '../../components/ui/toast';
import { Pencil, Trash2 } from 'lucide-react';
import type { Project } from '../../types/api';

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
        <h1 className="text-2xl font-bold">Projetos</h1>
        <Button onClick={() => { setEditingProject(undefined); setShowForm(true); }}>Novo Projeto</Button>
      </div>

      <Dialog open={showForm} onClose={() => { setShowForm(false); setEditingProject(undefined); }} title={editingProject ? 'Editar Projeto' : 'Novo Projeto'}>
        <ProjectForm onSuccess={() => { setShowForm(false); setEditingProject(undefined); toast(editingProject ? 'Projeto atualizado!' : 'Projeto criado!', 'success'); load(); }} onCancel={() => { setShowForm(false); setEditingProject(undefined); }} project={editingProject} />
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full text-center text-gray-400">Carregando...</div>
        ) : projects.length === 0 ? (
          <div className="col-span-full text-center text-gray-400">Nenhum projeto</div>
        ) : projects.map(project => (
          <Card key={project.id} className="group">
            <CardHeader className="flex flex-row items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color || '#ccc' }} />
              <CardTitle className="text-base flex-1">{project.name}</CardTitle>
              <Badge variant={project.status}>{project.status}</Badge>
              <button
                onClick={() => { setEditingProject(project); setShowForm(true); }}
                className="text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Editar"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(project.id)}
                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent>
              {project.description && (
                <p className="text-sm text-gray-500 mb-2">{project.description}</p>
              )}
              <p className="text-xs text-gray-400">
                {project._count?.tasks ?? 0} tarefa(s)
                {project.budget ? ` | Orçamento: R$ ${Number(project.budget).toFixed(2)}` : ''}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
