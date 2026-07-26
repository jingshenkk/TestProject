export type ShowcaseMediaKind = 'image' | 'video';

export interface ShowcaseMediaItem {
  id: string;
  title: string;
  category: 'AI短漫剧' | '景区宣传视频' | '电商营销视频';
  kind: ShowcaseMediaKind;
  src: string;
  poster?: string;
  duration: string;
  views: string;
}

export const showcaseMedia: ShowcaseMediaItem[] = [
  {
    id: 'xiangfuren-character',
    title: '湘夫人·角色三视图',
    category: 'AI短漫剧',
    kind: 'image',
    src: '/mock/legacy/character-xiangfuren.png',
    duration: '角色设定',
    views: '2.4k',
  },
  {
    id: 'changan-garden',
    title: '长安花园·场景主视角',
    category: '景区宣传视频',
    kind: 'image',
    src: '/mock/legacy/scene-changan-garden.png',
    duration: '场景参考',
    views: '1.8k',
  },
  {
    id: 'boudoir',
    title: '湘夫人闺阁·场景参考',
    category: 'AI短漫剧',
    kind: 'image',
    src: '/mock/legacy/scene-boudoir.png',
    duration: '场景参考',
    views: '1.5k',
  },
  {
    id: 'storyboard',
    title: 'E01_S01·四宫格分镜',
    category: 'AI短漫剧',
    kind: 'image',
    src: '/mock/legacy/storyboard-e01-s01.png',
    duration: '分镜板',
    views: '3.2k',
  },
  {
    id: 'guanghan-character',
    title: '广寒仙子·角色三视图',
    category: 'AI短漫剧',
    kind: 'image',
    src: '/mock/legacy/character-guanghan.png',
    duration: '角色设定',
    views: '2.1k',
  },
  {
    id: 'first-frame',
    title: 'E01_S01·视频首帧',
    category: '电商营销视频',
    kind: 'image',
    src: '/mock/legacy/firstframe-e01-s01.png',
    duration: '首帧参考',
    views: '1.7k',
  },
  {
    id: 'video-e01-s01',
    title: '茶花会·镜头 E01_S01',
    category: 'AI短漫剧',
    kind: 'video',
    src: '/mock/legacy/video-e01-s01.mp4',
    poster: '/mock/legacy/firstframe-e01-s01.png',
    duration: '00:08',
    views: '4.6k',
  },
  {
    id: 'video-e01-s13',
    title: '茶花会·镜头 E01_S13',
    category: '景区宣传视频',
    kind: 'video',
    src: '/mock/legacy/video-e01-s13.mp4',
    poster: '/mock/legacy/scene-changan-garden.png',
    duration: '00:07',
    views: '3.8k',
  },
  {
    id: 'video-e01-s27',
    title: '茶花会·镜头 E01_S27',
    category: '电商营销视频',
    kind: 'video',
    src: '/mock/legacy/video-e01-s27.mp4',
    poster: '/mock/legacy/storyboard-e01-s01.png',
    duration: '00:09',
    views: '5.1k',
  },
];

export const showcaseCategories = ['全部', 'AI短漫剧', '景区宣传视频', '电商营销视频'] as const;

