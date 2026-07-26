import { apiRequest } from '@/api/client';
import type { Project } from '@/types/project';

interface ProjectRead {
  id: number;
  name: string;
  status: string;
  current_phase: number;
  content_type: string;
  aspect_ratio: string;
  target_platform?: string | null;
  visual_style?: string | null;
  episode_count: number;
  episode_duration_sec: number;
  updated_at: string;
}

interface ProjectListResponse {
  items: ProjectRead[];
  total: number;
}

export interface CreateProjectRequest {
  name: string;
  content_type?: string;
  aspect_ratio?: string;
  visual_style?: string;
  episode_count?: number;
  episode_duration_sec?: number;
  brief?: Record<string, unknown>;
}

export interface UpdateProjectRequest {
  name?: string;
  status?: string;
  aspect_ratio?: string;
  visual_style?: string;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(date).replace(/\//g, '-');
}

function toProject(raw: ProjectRead): Project {
  return {
    id: raw.id,
    name: raw.name,
    lastUpdated: formatDate(raw.updated_at),
    code: raw.content_type || undefined,
    status: raw.status,
    currentPhase: raw.current_phase,
    contentType: raw.content_type,
    aspectRatio: raw.aspect_ratio,
    targetPlatform: raw.target_platform,
    visualStyle: raw.visual_style,
    episodeCount: raw.episode_count,
    episodeDurationSec: raw.episode_duration_sec,
  };
}

export async function fetchProjects(): Promise<Project[]> {
  const response = await apiRequest<ProjectListResponse>('/api/projects/?page_size=200');
  return response.items.map(toProject);
}

export async function fetchProject(id: number): Promise<Project> {
  return toProject(await apiRequest<ProjectRead>(`/api/projects/${id}`));
}

export async function createProject(payload: CreateProjectRequest): Promise<Project> {
  return toProject(await apiRequest<ProjectRead>('/api/projects/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export async function updateProject(id: number, payload: UpdateProjectRequest): Promise<Project> {
  return toProject(await apiRequest<ProjectRead>(`/api/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }));
}

export async function deleteProject(id: number): Promise<void> {
  await apiRequest(`/api/projects/${id}`, { method: 'DELETE' });
}
