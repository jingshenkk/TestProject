// P3-4：视频生成页 mock 数据与本地类型集中
// 注：此处的 Shot 与分镜页（@/components/ShotCard 的 Shot）结构不同，
// 是视频生成页独有的精简分镜项，故独立定义于本模块。

export interface VideoGenShot {
  id: string;
  code: string;
  duration: string;
  status: 'pending' | 'generating' | 'completed';
  progress: number;
}

export interface VideoVersion {
  id: string;
  name: string;
  isCurrent: boolean;
}

export interface ImageAsset {
  id: string;
  code: string;
  type: 'character' | 'scene' | 'prop';
  name: string;
  variant: string;
  viewType: string;
}

// 示例分镜数据
export const sampleShots: VideoGenShot[] = [
  { id: '1', code: 'E02_S01', duration: '20s', status: 'completed', progress: 100 },
  { id: '2', code: 'E02_S02', duration: '20s', status: 'completed', progress: 100 },
  { id: '3', code: 'E02_S03', duration: '20s', status: 'completed', progress: 100 },
  { id: '4', code: 'E02_S04', duration: '20s', status: 'generating', progress: 66 },
  { id: '5', code: 'E02_S05', duration: '20s', status: 'pending', progress: 0 },
  { id: '6', code: 'E02_S06', duration: '20s', status: 'pending', progress: 0 },
];

// 示例视频版本
export const videoVersions: VideoVersion[] = [
  { id: 'v1', name: 'V01', isCurrent: true },
  { id: 'v2', name: 'V02', isCurrent: false },
  { id: 'v3', name: 'V03', isCurrent: false },
  { id: 'v4', name: 'V04', isCurrent: false },
  { id: 'v5', name: 'V05', isCurrent: false },
];

// 示例图片资产
export const imageAssets: ImageAsset[] = [
  { id: '1', code: 'C01', type: 'character', name: '湘夫人', variant: '素白寝衣（闺阁）', viewType: '三视图' },
  { id: '2', code: 'S01', type: 'scene', name: '府邸花园', variant: '主视角场景图', viewType: '' },
  { id: '3', code: 'C01', type: 'prop', name: '湘夫人', variant: '素白寝衣（闺阁）', viewType: '三视图' },
];