import { apiAssetUrl, apiRequest } from '@/api/client';

export interface ImageAssetRecord {
  id: number;
  asset_type: string;
  name: string;
  character_id?: string | null;
  scene_id?: string | null;
  shot_id?: string | null;
  status: string;
  effective_status: string;
  file_exists: boolean;
  width?: number | null;
  height?: number | null;
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
  const response = await apiRequest<ImageAssetResponse>(`/api/assets/${projectId}/images?page_size=200`);
  return response.assets;
}

export function imageAssetUrl(asset: ImageAssetRecord): string | undefined {
  return asset.file_exists && asset.effective_status === 'completed'
    ? apiAssetUrl(asset.id)
    : undefined;
}
