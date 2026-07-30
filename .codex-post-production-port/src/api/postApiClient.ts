import { apiRequest } from './client';

type RequestConfig = { headers?: HeadersInit };
type ApiResponse<T> = { data: T };

function requestPath(path: string): string {
  return path.startsWith('/api/') ? path : '/api' + (path.startsWith('/') ? path : '/' + path);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
  return { data: await apiRequest<T>(requestPath(path), init) };
}

const postApiClient = {
  get<T>(path: string): Promise<ApiResponse<T>> {
    return request<T>(path);
  },
  post<T>(path: string, body?: unknown, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const formData = body instanceof FormData;
    const headers = new Headers(config.headers);
    if (formData) headers.delete('Content-Type');
    return request<T>(path, {
      method: 'POST',
      headers,
      body: body === undefined ? undefined : formData ? body : JSON.stringify(body),
    });
  },
};

export default postApiClient;
