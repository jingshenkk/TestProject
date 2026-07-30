export type WorkflowStage = 'script' | 'storyboard' | 'image' | 'video' | 'post';

const legacyPaths: Record<WorkflowStage, string> = {
  script: '/video',
  storyboard: '/storyboard',
  image: '/image',
  video: '/video-gen',
  post: '/post',
};

export function workflowPath(projectId: number | null | undefined, stage: WorkflowStage): string {
  if (!projectId || projectId <= 0) return legacyPaths[stage];
  return `/projects/${projectId}/${stage}`;
}

export function parseProjectId(value: string | undefined, fallback?: number | null): number {
  const fromRoute = Number(value);
  if (Number.isInteger(fromRoute) && fromRoute > 0) return fromRoute;
  return fallback && fallback > 0 ? fallback : 0;
}
