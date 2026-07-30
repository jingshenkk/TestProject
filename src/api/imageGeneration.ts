import { apiRequest } from '@/api/client';

export type ImageGenerationType =
  | 'character_sheet'
  | 'emotion_grid'
  | 'scene_reference'
  | 'overhead_map'
  | 'scene_spatial_anchor'
  | 'scene_camera_template'
  | 'camera_blocking'
  | 'style_anchor'
  | 'prop_reference'
  | 'video_first_frame'
  | 'storyboard';

export interface ImageGenerationContext {
  gridSize?: number;
  view?: string;
  modelProvider?: string;
  propName?: string;
  characterIds?: string[];
  sceneIds?: string[];
  shotIds?: string[];
  referenceAssetId?: number;
  force?: boolean;
}

export interface ImagePromptPreview {
  prompt: string;
  default_prompt?: string;
  asset_type: string;
  target_id: number;
  variant: string;
  model_provider?: string;
  prompt_flavor?: string;
  has_override?: boolean;
  override_ignored?: boolean;
  override_warning?: string;
  final_prompt?: string;
  reference_assets?: unknown[];
  [key: string]: unknown;
}

export interface ImageGenerationResult {
  message: string;
  file_path?: string;
  asset_id?: number;
  first_frame_ref?: number;
  validation?: unknown;
  [key: string]: unknown;
}

export interface ImageProductionPlan {
  summary?: Record<string, unknown>;
  coverage?: Array<Record<string, unknown>>;
  next_actions?: Array<Record<string, unknown>>;
  top_issues?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

function queryString(context: ImageGenerationContext = {}): string {
  const params = new URLSearchParams();
  if (context.gridSize != null) params.set('grid_size', String(context.gridSize));
  if (context.view) params.set('view', context.view);
  if (context.modelProvider) params.set('model_provider', context.modelProvider);
  if (context.propName) params.set('prop_name', context.propName);
  if (context.characterIds?.length) params.set('character_ids', context.characterIds.join(','));
  if (context.sceneIds?.length) params.set('scene_ids', context.sceneIds.join(','));
  if (context.shotIds?.length) params.set('shot_ids', context.shotIds.join(','));
  return params.toString();
}

function withQuery(path: string, context?: ImageGenerationContext): string {
  const query = queryString(context);
  return query ? `${path}?${query}` : path;
}

function endpointFor(projectId: number, type: ImageGenerationType, targetId: number): string {
  const root = `/api/image-gen/${projectId}`;
  switch (type) {
    case 'character_sheet': return `${root}/character-sheet/${targetId}`;
    case 'emotion_grid': return `${root}/emotion-grid/${targetId}`;
    case 'scene_reference': return `${root}/scene-reference/${targetId}`;
    case 'overhead_map': return `${root}/overhead-map/${targetId}`;
    case 'scene_spatial_anchor': return `${root}/spatial-anchor/${targetId}`;
    case 'scene_camera_template': return `${root}/camera-template/${targetId}`;
    case 'camera_blocking': return `${root}/camera-blocking/${targetId}`;
    case 'style_anchor': return `${root}/style-anchor`;
    case 'prop_reference': return `${root}/prop-reference`;
    case 'video_first_frame': return `${root}/video-first-frame/${targetId}`;
    case 'storyboard': return `${root}/storyboard/${targetId}`;
  }
}

export async function fetchImagePrompt(projectId: number, type: ImageGenerationType, targetId: number, context?: ImageGenerationContext): Promise<ImagePromptPreview> {
  return apiRequest<ImagePromptPreview>(withQuery(`/api/image-gen/prompt/${projectId}/${type}/${targetId}`, context));
}

export async function previewFinalImagePrompt(projectId: number, type: ImageGenerationType, targetId: number, prompt: string, context?: ImageGenerationContext): Promise<ImagePromptPreview> {
  return apiRequest<ImagePromptPreview>(withQuery(`/api/image-gen/prompt/${projectId}/${type}/${targetId}/final-preview`, context), {
    method: 'POST',
    body: JSON.stringify({
      custom_prompt: prompt,
      model_provider: context?.modelProvider || '',
      prop_name: context?.propName || '',
      character_ids: context?.characterIds || [],
      scene_ids: context?.sceneIds || [],
      shot_ids: context?.shotIds || [],
    }),
  });
}

export async function saveImagePrompt(projectId: number, type: ImageGenerationType, targetId: number, prompt: string, variant: string, context?: ImageGenerationContext): Promise<ImagePromptPreview> {
  return apiRequest<ImagePromptPreview>(withQuery(`/api/image-gen/prompt/${projectId}/${type}/${targetId}`, context), {
    method: 'PUT',
    body: JSON.stringify({ prompt, variant }),
  });
}

export async function resetImagePrompt(projectId: number, type: ImageGenerationType, targetId: number, context?: ImageGenerationContext): Promise<void> {
  await apiRequest(withQuery(`/api/image-gen/prompt/${projectId}/${type}/${targetId}`, context), { method: 'DELETE' });
}

export async function generateImage(projectId: number, type: ImageGenerationType, targetId: number, customPrompt: string, context: ImageGenerationContext = {}): Promise<ImageGenerationResult> {
  if (type === 'scene_spatial_anchor') {
    return apiRequest<ImageGenerationResult>(endpointFor(projectId, type, targetId), { method: 'POST' });
  }

  const params = new URLSearchParams(queryString(context));
  if (context.referenceAssetId != null) params.set('reference_asset_id', String(context.referenceAssetId));
  if (context.force) params.set('force', 'true');
  const path = `${endpointFor(projectId, type, targetId)}${params.size ? `?${params}` : ''}`;
  return apiRequest<ImageGenerationResult>(path, {
    method: 'POST',
    body: JSON.stringify({
      custom_prompt: customPrompt,
      model_provider: context.modelProvider || '',
      prop_name: context.propName || '',
      character_ids: context.characterIds || [],
      scene_ids: context.sceneIds || [],
      shot_ids: context.shotIds || [],
    }),
  });
}

export async function generateProjectStoryboard(projectId: number, gridSize: number, customPrompt: string, force = true): Promise<ImageGenerationResult> {
  const params = new URLSearchParams({ grid_size: String(gridSize), force: String(force) });
  return apiRequest<ImageGenerationResult>(`/api/image-gen/${projectId}/storyboard?${params}`, {
    method: 'POST',
    body: JSON.stringify({ custom_prompt: customPrompt }),
  });
}

export async function fetchSceneSpatialAnchor(projectId: number, sceneId: number): Promise<Record<string, unknown>> {
  return apiRequest<Record<string, unknown>>(`/api/image-gen/${projectId}/spatial-anchor/${sceneId}`);
}

export async function importCharacterImage(projectId: number, characterId: number, payload: { assetType: 'character_sheet' | 'emotion_grid'; filename: string; contentBase64: string; contentType: string; note?: string }): Promise<ImageGenerationResult> {
  return apiRequest<ImageGenerationResult>(`/api/image-gen/${projectId}/character-asset/${characterId}/import`, {
    method: 'POST',
    body: JSON.stringify({ asset_type: payload.assetType, filename: payload.filename, content_base64: payload.contentBase64, content_type: payload.contentType, note: payload.note || '' }),
  });
}

export async function importSceneImage(projectId: number, sceneId: number, payload: { filename: string; contentBase64: string; contentType: string; view: string; note?: string }): Promise<ImageGenerationResult> {
  return apiRequest<ImageGenerationResult>(`/api/image-gen/${projectId}/scene-reference/${sceneId}/import`, {
    method: 'POST',
    body: JSON.stringify({ filename: payload.filename, content_base64: payload.contentBase64, content_type: payload.contentType, view: payload.view, note: payload.note || '' }),
  });
}

export async function fetchImageProductionPlan(projectId: number): Promise<ImageProductionPlan> {
  return apiRequest<ImageProductionPlan>(`/api/image-gen/${projectId}/production-plan`);
}

export async function batchGenerateImages(projectId: number, actions: Array<Record<string, unknown>>): Promise<ImageGenerationResult> {
  return apiRequest<ImageGenerationResult>(`/api/image-gen/${projectId}/batch-generate`, {
    method: 'POST',
    body: JSON.stringify(actions),
  });
}
