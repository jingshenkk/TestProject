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
  get(path: string): Promise<ApiResponse<any>> {
    return request<any>(path);
  },
  post(path: string, body?: unknown, config: RequestConfig = {}): Promise<ApiResponse<any>> {
    const formData = body instanceof FormData;
    const headers = new Headers(config.headers);
    if (formData) headers.delete('Content-Type');
    return request<any>(path, {
      method: 'POST',
      headers,
      body: body === undefined ? undefined : formData ? body : JSON.stringify(body),
    });
  },
};

export default postApiClient;
