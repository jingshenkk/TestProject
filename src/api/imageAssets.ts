import { apiAssetUrl, apiRequest } from '@/api/client';

export interface ImageAssetRecord {
  id: number;
  asset_type: string;
  name: string;
  file_path?: string | null;
  character_id?: string | null;
  scene_id?: string | null;
  shot_id?: string | null;
  prompt_used?: string | null;
  generation_params?: string | null;
  status: string;
  effective_status: string;
  file_exists: boolean;
  width?: number | null;
  height?: number | null;
  file_size_bytes?: number | null;
  created_at?: string | null;
  version_number?: number;
  version_count?: number;
  is_current_version?: boolean;
}

interface ImageAssetResponse {
  assets: ImageAssetRecord[];
  total: number;
}

export async function fetchProjectImages(projectId: number): Promise<ImageAssetRecord[]> {
  const pageSize = 200;
  const first = await apiRequest<ImageAssetResponse>(`/api/assets/${projectId}/images?page=1&page_size=${pageSize}`);
  const pages = Math.max(1, Math.ceil(first.total / pageSize));
  if (pages === 1) return first.assets;

  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, index) => apiRequest<ImageAssetResponse>(
      `/api/assets/${projectId}/images?page=${index + 2}&page_size=${pageSize}`,
    )),
  );
  return [first, ...rest].flatMap((response) => response.assets);
}

export function imageAssetUrl(asset: ImageAssetRecord): string | undefined {
  return asset.file_exists && asset.effective_status === 'completed'
    ? apiAssetUrl(asset.id)
    : undefined;
}

export async function selectImageAssetVersion(projectId: number, assetId: number): Promise<void> {
  await apiRequest(`/api/assets/${projectId}/images/${assetId}/select`, { method: 'POST' });
}

export async function deleteImageAsset(assetId: number): Promise<void> {
  await apiRequest(`/api/assets/image/${assetId}`, { method: 'DELETE' });
}
