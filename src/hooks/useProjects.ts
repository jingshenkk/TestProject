import { useQuery } from '@tanstack/react-query';
import { fetchProjects } from '@/api/projects';

/**
 * P3-4：react-query 数据钩子示例（项目列表）。
 * 当前页面仍直接消费 src/mocks 的同步数据以最小化改动；
 * 此钩子作为"一次性切换"的参考范式，接真实后端时各页改用对应钩子即可。
 */
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });
}