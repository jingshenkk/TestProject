import type { Shot } from '@/components/ShotCard';
import { apiRequest } from '@/api/client';

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
  dialogue?: string | null;
  sfx?: string | null;
  bgm_mood?: string | null;
  motion_strength?: number | null;
  consistency_weight?: number | null;
  narrative_beat?: string | null;
  spatial_blocking_note?: string | null;
  sort_order: number;
}

export interface ShotListResponse {
  characters: CharacterRead[];
  scenes: SceneRead[];
  shots: BackendShot[];
  episodes: Array<{ episode: number; shot_count: number }>;
  pagination: { total: number };
}

export interface ScriptGenerateRequest {
  project_id: number;
  creative_brief: string;
  provider?: 'claude' | 'openai' | 'deepseek';
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

export function toStoryboardShot(shot: BackendShot): Shot {
  const durationSeconds = Number(shot.duration_sec || 0);
  return {
    id: String(shot.id),
    backendId: shot.id,
    code: shot.shot_id || `S${shot.id}`,
    type: shot.shot_type || '中景',
    movement: shot.camera_movement || '固定',
    duration: `${durationSeconds.toFixed(durationSeconds % 1 ? 1 : 0)}s`,
    durationSeconds,
    description: shot.visual_description || '暂未填写画面描述。',
    details: shot.sfx || shot.bgm_mood || '',
    tags: shot.narrative_beat ? [shot.narrative_beat] : [],
    sceneNo: shot.scene_id || '',
    motionIntensity: strengthLabel(shot.motion_strength),
    consistencyWeight: strengthLabel(shot.consistency_weight),
    viewType: shot.shot_type || '中景',
    cameraMovement: shot.camera_movement || '固定',
    cameraAngle: shot.camera_angle || '平拍',
    lensFocus: shot.depth_of_field || '人物',
    narrativeBeat: shot.narrative_beat || '',
    cameraPosition: shot.spatial_blocking_note || '',
    dialogue: shot.dialogue || '',
  };
}

export async function fetchShotList(projectId: number): Promise<ShotListResponse> {
  return apiRequest<ShotListResponse>(`/api/script/${projectId}/shot-list`);
}

export async function generateShotList(request: ScriptGenerateRequest): Promise<void> {
  await apiRequest('/api/script/generate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function updateStoryboardShot(shot: Shot): Promise<BackendShot> {
  if (!shot.backendId) {
    throw new Error('镜头缺少后端 ID，无法保存。');
  }
  return apiRequest<BackendShot>(`/api/script/shot/${shot.backendId}`, {
    method: 'PUT',
    body: JSON.stringify({
      duration_sec: shot.durationSeconds,
      shot_type: shot.viewType || shot.type,
      camera_movement: shot.cameraMovement || shot.movement,
      camera_angle: shot.cameraAngle,
      depth_of_field: shot.lensFocus,
      visual_description: shot.description,
      dialogue: shot.dialogue,
      narrative_beat: shot.narrativeBeat,
      spatial_blocking_note: shot.cameraPosition,
      motion_strength: strengthValue(shot.motionIntensity),
      consistency_weight: strengthValue(shot.consistencyWeight),
    }),
  });
}
