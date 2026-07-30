import type { Shot } from '@/components/ShotCard';
import { apiRequest } from '@/api/client';

export type ScriptProvider = 'claude' | 'openai' | 'deepseek';

export interface ScriptProviderStatus {
  key: ScriptProvider;
  name: string;
  model: string;
  configured: boolean;
}

export interface ScriptGenerationTask {
  id: number;
  project_id: number;
  task_type: string;
  target_asset_type?: string | null;
  target_asset_id?: number | null;
  status: 'queued' | 'running' | 'canceling' | 'completed' | 'failed' | 'canceled' | string;
  progress: number;
  progress_message?: string | null;
  error_message?: string | null;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface CharacterRead {
  id: number;
  project_id: number;
  char_id: string;
  name: string;
  role?: string | null;
  gender?: string | null;
  age_range?: string | null;
  height_cm?: number | null;
  build?: string | null;
  face?: string | null;
  hair?: string | null;
  signature_outfit?: string | null;
  character_arc?: string | null;
  character_type?: string | null;
}

export interface SceneRead {
  id: number;
  project_id: number;
  scene_id: string;
  name?: string | null;
  location?: string | null;
  time_of_day?: string | null;
  lighting?: string | null;
  mood?: string | null;
  spatial_notes?: string | null;
}

export interface BackendShot {
  id: number;
  project_id: number;
  episode: number;
  shot_id: string;
  scene_id?: string | null;
  duration_sec?: number | null;
  shot_type?: string | null;
  camera_movement?: string | null;
  camera_angle?: string | null;
  camera_lens?: string | null;
  depth_of_field?: string | null;
  visual_description?: string | null;
  character_actions?: string | null;
  dialogue?: string | null;
  sfx?: string | null;
  bgm_mood?: string | null;
  video_mode?: string | null;
  first_frame_ref?: number | null;
  last_frame_ref?: number | null;
  motion_strength?: number | null;
  consistency_weight?: number | null;
  narrative_beat?: string | null;
  spatial_blocking_note?: string | null;
  duration_basis?: Record<string, unknown> | null;
  sort_order: number;
}

export interface RhythmMapRead {
  hook_0_3s: string;
  explosion_30s: string;
  first_win_60s: string;
  twist_90s: string;
  second_win_120s: string;
  cliffhanger_150s: string;
  countdown_end: string;
}

export interface ShotListPagination {
  episode: number | null;
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_more: boolean;
}

export interface ShotListResponse {
  characters: CharacterRead[];
  scenes: SceneRead[];
  shots: BackendShot[];
  episodes: Array<{ episode: number; shot_count: number }>;
  rhythm_map?: RhythmMapRead | null;
  pagination: ShotListPagination;
}

export interface ScriptGenerateRequest {
  project_id: number;
  creative_brief: string;
  provider?: ScriptProvider;
}

export interface ScriptCharacterSetup {
  name: string;
  role: string;
  description: string;
  personality: string;
  relationships: string;
  arc: string;
}

export interface ScriptEpisodePlan {
  episode: number;
  title: string;
  summary: string;
}

export interface ScriptSetup {
  title: string;
  logline: string;
  synopsis: string;
  genre: string;
  style_type: string;
  tone: string;
  characters: ScriptCharacterSetup[];
  episodes: ScriptEpisodePlan[];
  source_brief?: string;
}

export interface ScriptSetupResponse {
  project_id: number;
  setup: ScriptSetup;
  cleared: Record<string, number>;
}

export interface ScriptDocumentRead {
  id: number;
  project_id: number;
  title: string | null;
  content: string;
  source: string | null;
  status: string | null;
  revision_note: string | null;
  author: string | null;
  metadata_json: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ScriptDocumentConvertRequest {
  document_id?: number;
  content?: string;
  overwrite?: boolean;
  dry_run?: boolean;
  converted_by?: string;
  allow_downstream_overwrite?: boolean;
  intended_character_count?: number;
  intended_scene_count?: number;
}

export interface ScriptDocumentConvertResponse {
  counts?: { characters?: number; scenes?: number; shots?: number; [key: string]: number | undefined };
  downstream_assets?: { total?: number; [key: string]: unknown };
  diagnostics?: { readiness?: { score?: number; [key: string]: unknown }; [key: string]: unknown };
  dry_run?: boolean;
  [key: string]: unknown;
}

export interface EpisodeDocumentGenerateRequest {
  creative_brief: string;
  provider: ScriptProvider;
  title?: string;
  start_episode: number;
  end_episode: number;
  project_brief_snapshot?: Record<string, unknown>;
  merge_with_latest?: boolean;
}

export interface EpisodeDocumentGenerateResponse {
  document: ScriptDocumentRead;
  batch: Record<string, unknown>;
}

export interface EpisodeDocumentTaskResponse {
  task: ScriptGenerationTask;
  document?: ScriptDocumentRead | null;
  batch?: Record<string, unknown>;
  runtime?: Record<string, unknown>;
  episode_range?: {
    start?: number | null;
    end?: number | null;
    count?: number | null;
  };
  existing_task?: boolean;
}

export interface EpisodeWorkspaceItem {
  episode: number;
  title: string;
  summary: string;
  content: string;
  status: 'generated' | 'pending';
}

function strengthLabel(value?: number | null): string {
  if (value == null) return '中';
  if (value < 0.34) return '低';
  if (value > 0.67) return '高';
  return '中';
}

function strengthValue(value?: string): number {
  if (value === '低') return 0.2;
  if (value === '高') return 0.8;
  return 0.5;
}

function chineseEpisodeNumber(value: string): number | null {
  const normalized = value.trim();
  if (/^\d+$/.test(normalized)) return Number(normalized);
  const digits: Record<string, number> = { 零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  if (normalized === '十') return 10;
  if (normalized.includes('十')) {
    const [left, right] = normalized.split('十');
    const tens = left ? digits[left] : 1;
    const ones = right ? digits[right] : 0;
    return tens * 10 + ones;
  }
  return normalized.length === 1 && normalized in digits ? digits[normalized] : null;
}

export function deriveEpisodeWorkspace(content: string, plan: ScriptEpisodePlan[] = [], totalEpisodes = 1): EpisodeWorkspaceItem[] {
  const planByEpisode = new Map(plan.map((item) => [item.episode, item]));
  const headingPattern = /^\s*第\s*([0-9一二两三四五六七八九十零〇]+)\s*[集话回]\s*(?:[｜|:：—-]\s*)?([^\r\n]*)/gim;
  const headings = [...content.matchAll(headingPattern)]
    .map((match) => ({ episode: chineseEpisodeNumber(match[1]) ?? 0, title: match[2].trim(), start: match.index ?? 0, contentStart: (match.index ?? 0) + match[0].length }))
    .filter((item) => item.episode > 0 && item.episode <= totalEpisodes);
  const contentByEpisode = new Map<number, { title: string; content: string }>();
  headings.forEach((heading, index) => {
    const nextStart = headings[index + 1]?.start ?? content.length;
    contentByEpisode.set(heading.episode, { title: heading.title, content: content.slice(heading.contentStart, nextStart).trim() });
  });
  if (!headings.length && content.trim()) contentByEpisode.set(1, { title: '', content: content.trim() });

  return Array.from({ length: Math.max(1, totalEpisodes) }, (_, index) => {
    const episode = index + 1;
    const source = contentByEpisode.get(episode);
    const planned = planByEpisode.get(episode);
    return {
      episode,
      title: source?.title || planned?.title || '第' + episode + '集',
      summary: planned?.summary || '待补充分集剧情简介',
      content: source?.content || '',
      status: source?.content ? 'generated' : 'pending',
    };
  });
}

export function composeEpisodeDocument(episodes: EpisodeWorkspaceItem[]): string {
  return episodes
    .filter((item) => item.content.trim())
    .map((item) => '第' + item.episode + '集｜' + (item.title.trim() || '第' + item.episode + '集') + '\n' + item.content.trim())
    .join('\n\n');
}

export function toStoryboardShot(shot: BackendShot): Shot {
  const durationSeconds = Number(shot.duration_sec || 0);
  return {
    id: String(shot.id),
    backendId: shot.id,
    code: shot.shot_id || 'S' + shot.id,
    type: shot.shot_type || '中景',
    movement: shot.camera_movement || '固定',
    duration: durationSeconds.toFixed(durationSeconds % 1 ? 1 : 0) + 's',
    durationSeconds,
    description: shot.visual_description || '暂未填写画面描述。',
    details: shot.spatial_blocking_note || '',
    tags: shot.narrative_beat ? [shot.narrative_beat] : [],
    episode: shot.episode,
    sceneNo: shot.scene_id || '',
    motionIntensity: strengthLabel(shot.motion_strength),
    consistencyWeight: strengthLabel(shot.consistency_weight),
    viewType: shot.shot_type || '中景',
    cameraMovement: shot.camera_movement || '固定',
    cameraAngle: shot.camera_angle || '平拍',
    lensFocus: shot.depth_of_field || '人物',
    cameraLens: shot.camera_lens || '',
    characterActions: shot.character_actions || '',
    narrativeBeat: shot.narrative_beat || '',
    cameraPosition: shot.spatial_blocking_note || '',
    dialogue: shot.dialogue || '',
    sfx: shot.sfx || '',
    bgmMood: shot.bgm_mood || '',
    videoMode: shot.video_mode || 'image2video',
    firstFrameRef: shot.first_frame_ref ?? undefined,
    lastFrameRef: shot.last_frame_ref ?? undefined,
    durationBasis: shot.duration_basis || undefined,
    sortOrder: shot.sort_order,
  };
}

export async function fetchShotList(projectId: number, episode?: number): Promise<ShotListResponse> {
  const params = new URLSearchParams();
  if (episode != null) params.set('episode', String(episode));
  const query = params.toString();
  return apiRequest<ShotListResponse>('/api/script/' + projectId + '/shot-list' + (query ? '?' + query : ''));
}

export async function generateShotList(request: ScriptGenerateRequest): Promise<void> {
  await apiRequest('/api/script/generate', { method: 'POST', body: JSON.stringify(request) });
}

export async function fetchScriptProviders(): Promise<ScriptProviderStatus[]> {
  const response = await apiRequest<{ providers: ScriptProviderStatus[] }>('/api/script/providers');
  return response.providers;
}

export async function generateScriptSetup(request: ScriptGenerateRequest): Promise<ScriptSetupResponse> {
  return apiRequest<ScriptSetupResponse>('/api/script/setup/generate', { method: 'POST', body: JSON.stringify(request) });
}

export async function saveScriptSetup(projectId: number, setup: ScriptSetup): Promise<ScriptSetupResponse> {
  return apiRequest<ScriptSetupResponse>('/api/script/' + projectId + '/setup', {
    method: 'PUT',
    body: JSON.stringify({ setup, clear_generated_content: true }),
  });
}

export async function generateEpisodeDocument(projectId: number, request: EpisodeDocumentGenerateRequest): Promise<EpisodeDocumentGenerateResponse> {
  return apiRequest<EpisodeDocumentGenerateResponse>('/api/script/' + projectId + '/document/generate-episodes', {
    method: 'POST',
    body: JSON.stringify({ ...request, merge_with_latest: request.merge_with_latest ?? true }),
  });
}

export async function queueEpisodeDocument(projectId: number, request: EpisodeDocumentGenerateRequest): Promise<EpisodeDocumentTaskResponse> {
  return apiRequest<EpisodeDocumentTaskResponse>('/api/script/' + projectId + '/document/generate-episodes/queue', {
    method: 'POST',
    body: JSON.stringify({ ...request, merge_with_latest: request.merge_with_latest ?? true }),
  });
}

export async function fetchActiveEpisodeDocumentTask(projectId: number): Promise<EpisodeDocumentTaskResponse | null> {
  const response = await apiRequest<{ task: ScriptGenerationTask | null; episode_range?: EpisodeDocumentTaskResponse['episode_range']; runtime?: Record<string, unknown> }>(
    '/api/script/' + projectId + '/document/generate-episodes/active',
  );
  return response.task ? { task: response.task, episode_range: response.episode_range, runtime: response.runtime } : null;
}

export async function fetchEpisodeDocumentTask(projectId: number, taskId: number): Promise<EpisodeDocumentTaskResponse> {
  return apiRequest<EpisodeDocumentTaskResponse>('/api/script/' + projectId + '/document/generate-episodes/task/' + taskId);
}

export async function cancelEpisodeDocumentTask(projectId: number, taskId: number): Promise<EpisodeDocumentTaskResponse> {
  return apiRequest<EpisodeDocumentTaskResponse>('/api/script/' + projectId + '/document/generate-episodes/task/' + taskId + '/cancel', {
    method: 'POST',
  });
}

export async function fetchScriptDocument(projectId: number): Promise<ScriptDocumentRead | null> {
  const response = await apiRequest<{ document: ScriptDocumentRead | null }>('/api/script/' + projectId + '/document');
  return response.document;
}

export async function saveScriptDocument(projectId: number, document: Pick<ScriptDocumentRead, 'title' | 'content'>): Promise<ScriptDocumentRead> {
  const response = await apiRequest<{ document: ScriptDocumentRead }>('/api/script/' + projectId + '/document', {
    method: 'POST',
    body: JSON.stringify({ title: document.title || '剧本大纲', content: document.content, source: 'new_frontend_script_workspace', status: 'draft', author: 'new_frontend' }),
  });
  return response.document;
}

export async function convertScriptDocument(
  projectId: number,
  request: ScriptDocumentConvertRequest,
): Promise<ScriptDocumentConvertResponse> {
  return apiRequest<ScriptDocumentConvertResponse>(`/api/script/${projectId}/document/convert`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function updateStoryboardShot(shot: Shot): Promise<BackendShot> {
  if (!shot.backendId) throw new Error('镜头缺少后端 ID，无法保存。');
  return apiRequest<BackendShot>('/api/script/shot/' + shot.backendId, {
    method: 'PUT',
    body: JSON.stringify({
      episode: shot.episode,
      shot_id: shot.code,
      scene_id: shot.sceneNo,
      duration_sec: shot.durationSeconds,
      shot_type: shot.viewType || shot.type,
      camera_movement: shot.cameraMovement || shot.movement,
      camera_angle: shot.cameraAngle,
      camera_lens: shot.cameraLens,
      depth_of_field: shot.lensFocus,
      visual_description: shot.description,
      character_actions: shot.characterActions,
      dialogue: shot.dialogue,
      sfx: shot.sfx,
      bgm_mood: shot.bgmMood,
      video_mode: shot.videoMode,
      first_frame_ref: shot.firstFrameRef ?? null,
      last_frame_ref: shot.lastFrameRef ?? null,
      narrative_beat: shot.narrativeBeat,
      spatial_blocking_note: shot.cameraPosition,
      motion_strength: strengthValue(shot.motionIntensity),
      consistency_weight: strengthValue(shot.consistencyWeight),
      sort_order: shot.sortOrder,
    }),
  });
}
