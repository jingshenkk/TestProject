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
  brief_json?: string | null;
  episode_count: number;
  episode_duration_sec: number;
  updated_at: string;
}

interface ProjectListResponse {
  items: ProjectRead[];
  total: number;
}

export interface ProjectRecipe {
  key: string;
  label: string;
  description: string;
  workflow_template: string;
  default_aspect_ratio: string;
  default_platforms: string[];
  default_visual_style: string;
  default_episode_count: number;
  default_episode_duration_sec: number;
  brief_fields: string[];
  brief_hints?: Record<string, string>;
}

export interface ProjectCreationDraft {
  name: string;
  content_type: string;
  workflow_template: string;
  brief: Record<string, string>;
  target_platform: string[];
  aspect_ratio: string;
  visual_style: string;
  color_palette: string[];
  episode_count: number;
  episode_duration_sec: number;
  model_policy: Record<string, string>;
  script_provider: 'claude' | 'openai' | 'deepseek';
  source_brief: string;
}

export interface ProjectCreationDraftRequest {
  creative_brief: string;
  content_type: string;
  provider: 'claude' | 'openai' | 'deepseek';
}

export interface CreateProjectFromCreativeBriefRequest {
  creative_brief: string;
  content_type: string;
  provider: 'claude' | 'openai' | 'deepseek';
  name_hint?: string;
}

export interface ProjectCreationStartResponse {
  project: Project;
  creationStatus: 'generating' | 'ready' | 'failed';
}

export interface CreateProjectRequest {
  name: string;
  content_type?: string;
  aspect_ratio?: string;
  visual_style?: string;
  episode_count?: number;
  episode_duration_sec?: number;
  brief?: Record<string, unknown>;
  workflow_template?: string;
  target_platform?: string;
  color_palette?: string[];
  model_policy?: Record<string, string>;
  enforce_brief?: boolean;
}

export interface UpdateProjectRequest {
  name?: string;
  status?: string;
  aspect_ratio?: string;
  visual_style?: string;
}

function parseBrief(value?: string | null): Record<string, unknown> | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : undefined;
  } catch {
    return undefined;
  }
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
    brief: parseBrief(raw.brief_json),
    episodeCount: raw.episode_count,
    episodeDurationSec: raw.episode_duration_sec,
  };
}

export async function fetchProjectRecipes(): Promise<ProjectRecipe[]> {
  const response = await apiRequest<{ recipes: ProjectRecipe[] }>('/api/projects/recipes');
  return response.recipes;
}

export async function generateProjectCreationDraft(payload: ProjectCreationDraftRequest): Promise<ProjectCreationDraft> {
  return apiRequest<ProjectCreationDraft>('/api/projects/creation-draft/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createProjectFromCreativeBrief(payload: CreateProjectFromCreativeBriefRequest): Promise<ProjectCreationStartResponse> {
  const response = await apiRequest<{ project: ProjectRead; creation_status: ProjectCreationStartResponse['creationStatus'] }>('/api/projects/from-creative-brief', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return {
    project: toProject(response.project),
    creationStatus: response.creation_status,
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
