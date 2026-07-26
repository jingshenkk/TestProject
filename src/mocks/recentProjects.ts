// P3-4：首页"最近个人项目" mock 集中
// 注：此处的 RecentProject 与 @/mocks/projects 的 Project 结构不同（首页卡片精简版），故独立定义。

export interface RecentProject {
  id: number;
  title: string;
  date: string;
  cover?: string;
}

export const recentProjects: RecentProject[] = [
  { id: 1, title: '三体2-终极之战', date: '2026-07-13' },
  { id: 2, title: '三体2-终极之战', date: '2026-07-13' },
  { id: 3, title: '三体2-终极之战', date: '2026-07-13' },
  { id: 4, title: '三体2-终极之战', date: '2026-07-13' },
  { id: 5, title: '三体2-终极之战', date: '2026-07-13' },
];