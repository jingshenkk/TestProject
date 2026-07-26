import type { Project } from '@/types/project';

export interface LocalDemoProject {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  previewVideo?: string;
  assetSummary: string;
  updatedAt: string;
}

export const localDemoProjects: LocalDemoProject[] = [
  {
    id: 'mock-xiangfuren',
    name: '湘夫人',
    description: '古风人物、场景、空间图与四宫格分镜的本地展示项目。',
    coverImage: '/mock/legacy/character-xiangfuren.png',
    assetSummary: '27 张图片资产 · 角色三视图 / 花园 / 闺阁 / 分镜板',
    updatedAt: '本地 Mock · 2026-07-26',
  },
  {
    id: 'mock-chahuahui',
    name: '茶花会',
    description: '含首帧、分镜、场景图和可播放镜头样片的本地展示项目。',
    coverImage: '/mock/legacy/firstframe-e01-s01.png',
    previewVideo: '/mock/legacy/video-e01-s01.mp4',
    assetSummary: '24 张图片资产 · 3 段 MP4 样片 · 镜头与首帧参考',
    updatedAt: '本地 Mock · 2026-07-26',
  },
];

export function toMockWorkspaceProject(project: LocalDemoProject): Project {
  const projectIndex = localDemoProjects.findIndex((item) => item.id === project.id);
  return {
    id: -100 - Math.max(0, projectIndex),
    name: project.name,
    coverImage: project.coverImage,
    lastUpdated: project.updatedAt,
    code: 'LOCAL_MOCK',
    status: '本地样例',
    currentPhase: 1,
    contentType: 'ai_short_drama',
    aspectRatio: '16:9',
    targetPlatform: '本地演示',
    visualStyle: project.name === '湘夫人' ? '古风电影感' : '电影感写实',
    episodeCount: 5,
    episodeDurationSec: 60,
    isMock: true,
  };
}
