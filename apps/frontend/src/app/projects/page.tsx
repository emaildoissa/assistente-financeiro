'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import type { Project } from '../../types/api';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Projetos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full text-center text-gray-400">Carregando...</div>
        ) : projects.length === 0 ? (
          <div className="col-span-full text-center text-gray-400">Nenhum projeto</div>
        ) : projects.map(project => (
          <Card key={project.id}>
            <CardHeader className="flex flex-row items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color || '#ccc' }} />
              <CardTitle className="text-base">{project.name}</CardTitle>
              <Badge variant={project.status}>{project.status}</Badge>
            </CardHeader>
            <CardContent>
              {project.description && (
                <p className="text-sm text-gray-500 mb-2">{project.description}</p>
              )}
              <p className="text-xs text-gray-400">
                {project._count?.tasks ?? 0} tarefa(s)
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
