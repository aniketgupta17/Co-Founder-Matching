'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/app/components/ui/card';

interface Project {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface ProjectPageProps {
  params: {
    projectId: string;
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = params;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select('*') // Adjust selection as needed
          .eq('id', projectId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          setProject(data as Project);
        } else {
          // Handle project not found, e.g., by redirecting or showing a 404
          // For now, we'll just set an error
          setError('Project not found.');
        }
      } catch (err: any) {
        console.error('Error fetching project:', err);
        setError(err.message || 'Failed to fetch project data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) {
    return <div className="p-6">Loading project details...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!project) {
    return <div className="p-6">Project not found.</div>;
  }

  return (
    <div className="space-y-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>{project.title || 'Project Title'}</CardTitle>
          {project.created_at && (
            <CardDescription>
              Created on: {new Date(project.created_at).toLocaleDateString()}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <p>{project.description || 'No description available.'}</p>
        </CardContent>
      </Card>
    </div>
  );
} 