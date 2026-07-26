export class ApiError extends Error {
  readonly status: number;
  readonly payload?: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '');
const API_BASE_URL = configuredBaseUrl || '';

function buildUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const isJsonBody = init.body !== undefined && !(init.body instanceof FormData);
  if (isJsonBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '');

  if (!response.ok) {
    const detail = typeof payload === 'object' && payload && 'detail' in payload
      ? String(payload.detail)
      : typeof payload === 'string' && payload
        ? payload
        : `请求失败（${response.status}）`;
    throw new ApiError(response.status, detail, payload);
  }

  return payload as T;
}

export function apiAssetUrl(assetId: number): string {
  return buildUrl(`/api/assets/file/${assetId}`);
}

export function apiVideoUrl(assetId: number): string {
  return buildUrl(`/api/assets/video/${assetId}`);
}
