// P3-4：首页"参考视频" mock 集中（分类标签 + 视频占位列表）

export const categories: string[] = [
  '全部',
  'AI短漫剧',
  '景区宣传视频',
  '电商营销视频',
  '......',
];

export interface ReferenceVideo {
  id: number;
  title: string;
}

export const videos: ReferenceVideo[] = [
  { id: 1, title: '参考视频' },
  { id: 2, title: '参考视频' },
  { id: 3, title: '参考视频' },
  { id: 4, title: '参考视频' },
  { id: 5, title: '参考视频' },
  { id: 6, title: '参考视频' },
  { id: 7, title: '参考视频' },
  { id: 8, title: '参考视频' },
];