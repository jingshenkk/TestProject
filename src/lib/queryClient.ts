import { QueryClient } from '@tanstack/react-query';

/**
 * P3-4：react-query 全局 QueryClient。
 * 默认配置：关闭窗口聚焦重拉（原型阶段无需）、失败重试 1 次、staleTime 30s，
 * 避免接真实数据后频繁请求；后续按需调整。
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});