// P3-4：分镜页侧边栏的"分集"列表 mock（与 EpisodeList 的分集数据结构不同，独立存放）

export interface StoryboardEpisode {
  id: string;
  title: string;
  active?: boolean;
}

export const storyboardEpisodes: StoryboardEpisode[] = [
  { id: 'S01', title: '第一集：被迫封神' },
  { id: 'S02', title: '第二集：遇刺' },
  { id: 'S03', title: '第三集：湖底悟道', active: true },
];