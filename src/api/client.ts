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
const API_TIMEOUT_MS = 120_000;
const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);
const RETRY_DELAYS_MS = [1_000, 3_000];

function buildUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function readErrorMessage(status: number, payload: unknown): string {
  const detail = typeof payload === 'object' && payload && 'detail' in payload
    ? String(payload.detail)
    : typeof payload === 'string' && payload
      ? payload
      : `请求失败（${status}）`;
  return detail;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function createRequestSignal(externalSignal?: AbortSignal): { signal: AbortSignal; cleanup: () => void; timedOut: () => boolean } {
  const controller = new AbortController();
  let timeoutTriggered = false;
  const onExternalAbort = () => controller.abort(externalSignal?.reason);
  const timer = window.setTimeout(() => {
    timeoutTriggered = true;
    controller.abort(new DOMException('请求超时', 'TimeoutError'));
  }, API_TIMEOUT_MS);
  if (externalSignal) {
    if (externalSignal.aborted) onExternalAbort();
    else externalSignal.addEventListener('abort', onExternalAbort, { once: true });
  }
  return {
    signal: controller.signal,
    cleanup: () => {
      window.clearTimeout(timer);
      externalSignal?.removeEventListener('abort', onExternalAbort);
    },
    timedOut: () => timeoutTriggered,
  };
}

/**
 * New frontend transport intentionally follows the established legacy contract:
 * 120-second request timeout, two retries for transient failures, and cookie-based
 * authentication for the current FastAPI backend.
 */
export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const isJsonBody = init.body !== undefined && !(init.body instanceof FormData);
  if (isJsonBody && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  let lastError: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    const request = createRequestSignal(init.signal ?? undefined);
    try {
      const response = await fetch(buildUrl(path), {
        ...init,
        headers,
        signal: request.signal,
        credentials: 'include',
      });
      const contentType = response.headers.get('content-type') || '';
      const payload = contentType.includes('application/json')
        ? await response.json().catch(() => null)
        : await response.text().catch(() => '');
      if (response.ok) return payload as T;

      const error = new ApiError(response.status, readErrorMessage(response.status, payload), payload);
      lastError = error;
      if (!RETRYABLE_STATUSES.has(response.status) || attempt === RETRY_DELAYS_MS.length) throw error;
    } catch (error) {
      if (init.signal?.aborted) throw error;
      if (request.timedOut()) {
        lastError = new ApiError(408, '请求超时，请稍后重试。');
      } else {
        lastError = error;
      }
      const status = error instanceof ApiError ? error.status : 0;
      const retryable = status === 0 || RETRYABLE_STATUSES.has(status) || request.timedOut();
      if (!retryable || attempt === RETRY_DELAYS_MS.length) throw lastError;
    } finally {
      request.cleanup();
    }
    await wait(RETRY_DELAYS_MS[attempt]);
  }
  throw lastError instanceof Error ? lastError : new ApiError(500, '请求失败');
}

export function apiAssetUrl(assetId: number): string {
  return buildUrl(`/api/assets/file/${assetId}`);
}

export function apiVideoUrl(assetId: number): string {
  return buildUrl(`/api/assets/video/${assetId}`);
}
