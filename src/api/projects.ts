import { sampleProjects, type Project } from '@/mocks/projects';

/**
 * P3-4：数据层契约骨架。
 * 当前直接返回 mock 数据（外加微延时模拟网络），未来接后端时仅替换函数体为真实 fetch，
 * 调用方（react-query hooks）无需改动。
 */

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function fetchProjects(): Promise<Project[]> {
  return delay(sampleProjects);
}

export function fetchProject(id: string): Promise<Project | undefined> {
  return delay(sampleProjects.find((p) => p.id === id));
}