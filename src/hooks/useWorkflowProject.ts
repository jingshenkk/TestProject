import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { fetchProject } from '@/api/projects';
import { parseProjectId } from '@/lib/projectWorkflow';
import { getSelectedProject, setSelectedProject } from '@/stores/selectedProject';

/**
 * Resolves the workflow project from the URL first and only falls back to the
 * in-memory selection for legacy routes. This keeps the production workflow
 * recoverable after refreshes and deep links.
 */
export function useWorkflowProject() {
  const { projectId: projectIdParam } = useParams<{ projectId?: string }>();
  const rememberedProject = getSelectedProject();
  const projectId = parseProjectId(projectIdParam, rememberedProject?.id);
  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    refetchInterval: (query) => query.state.data?.brief?.creation_status === 'generating' ? 2_000 : false,
    queryFn: () => fetchProject(projectId),
    enabled: projectId > 0 && !rememberedProject?.isMock,
  });
  const project = projectQuery.data ?? (rememberedProject?.id === projectId ? rememberedProject : null);

  useEffect(() => {
    if (project) setSelectedProject(project);
  }, [project]);

  return { projectId, project, projectQuery };
}
