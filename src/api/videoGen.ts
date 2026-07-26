import { apiRequest } from '@/api/client';
import { fetchShotList, type BackendShot } from '@/api/script';
import { fetchProjectImages, type ImageAssetRecord } from '@/api/imageAssets';

export interface VideoGenShot {
  id: number;
  code: string;
  duration: string;
  status: 'pending' | 'generating' | 'completed';
  progress: number;
}

export interface VideoVersion {
  id: number;
  name: string;
  isCurrent: boolean;
  status: string;
  fileExists: boolean;
}

export interface VideoAssetRecord {
  id: number;
  shot_id: number;
  candidate_number: number;
  status: string;
  effective_status: string;
  file_exists: boolean;
  review_role: string;
  duration_sec?: number | null;
}

export interface GenerationTask {
  id: number;
  status: string;
  progress: number;
  progress_message?: string | null;
  error_message?: string | null;
}

function toVideoGenShot(shot: BackendShot): VideoGenShot {
  return {
    id: shot.id,
    code: shot.shot_id || `S${shot.id}`,
    duration: `${Number(shot.duration_sec || 0).toFixed(1)}s`,
    status: 'pending',
    progress: 0,
  };
}

export async function fetchVideoGenShots(projectId: number): Promise<VideoGenShot[]> {
  const response = await fetchShotList(projectId);
  return response.shots.map(toVideoGenShot);
}

export async function fetchVideoVersions(projectId: number, shotId?: number): Promise<VideoVersion[]> {
  const query = shotId ? `?shot_ids=${shotId}` : '';
  const response = await apiRequest<{ videos: VideoAssetRecord[] }>(`/api/video-gen/${projectId}/videos${query}`);
  return response.videos.map((video, index) => ({
    id: video.id,
    name: `V${String(video.candidate_number || index + 1).padStart(2, '0')}`,
    isCurrent: video.review_role === 'review_selected' || index === 0,
    status: video.effective_status,
    fileExists: video.file_exists,
  }));
}

export async function fetchImageAssets(projectId: number): Promise<ImageAssetRecord[]> {
  return fetchProjectImages(projectId);
}

export async function submitVideoGeneration(
  shotId: number,
  payload: { referenceAssetIds?: number[]; customPrompt?: string; resolution?: string; aspectRatio?: string },
): Promise<{ task_id?: number; video_asset_id?: number }> {
  const query = new URLSearchParams({
    resolution: payload.resolution || '1080p',
    aspect_ratio: payload.aspectRatio || '16:9',
  });
  return apiRequest(`/api/video-gen/shot/${shotId}?${query.toString()}`, {
    method: 'POST',
    body: JSON.stringify({
      reference_asset_ids: payload.referenceAssetIds || [],
      custom_prompt: payload.customPrompt || '',
    }),
  });
}

export async function fetchVideoTask(taskId: number): Promise<GenerationTask> {
  return apiRequest<GenerationTask>(`/api/video-gen/task/${taskId}`);
}
