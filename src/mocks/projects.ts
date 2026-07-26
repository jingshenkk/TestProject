// P3-4：mock 数据集中到 src/mocks/，未来接 API 时只需替换为 src/api 的真实拉取

export interface Project {
  id: string;
  name: string;
  coverImage?: string;
  lastUpdated: string;
  code?: string;
}

// 示例项目数据
export const sampleProjects: Project[] = [
  {
    id: '1',
    name: '三体 2 终极之战',
    coverImage: '/project-cover-1.jpg',
    lastUpdated: '2026-07-20 13:30',
  },
  {
    id: '2',
    name: '未命名项目',
    code: 'DJ02',
    lastUpdated: '2026-07-19 10:15',
  },
  {
    id: '3',
    name: '未命名项目',
    code: 'DJ02',
    lastUpdated: '2026-07-18 09:20',
  },
];