import type { Asset, Character, Scene, Prop } from '@/types/asset';

// P3-4：图像创作页的三类资产示例数据集中（类型规范来源在 @/types/asset）

// 示例角色数据
export const sampleCharacters: Character[] = [
  {
    id: '1',
    code: 'C01',
    kind: 'character',
    name: '罗辑',
    description: '主角·人类·男·青年',
    imageUrl: '/character-luoji.jpg',
    hasImage: true,
    totalVersions: 3,
    currentVersion: 2,
    details: {
      intro: '大学社会学教授，被强行选为面壁者，核心动机从拒绝救世到主动承担文明存续责任',
      relatedShots: ['E01_S01', 'E01_S02', 'E01_S03', 'E01_S04', 'E01_S05', 'E01_S06', 'E01_S07', 'E01_S08'],
      fields: {
        type: '人类',
        name: '湘夫人',
        function: '主角',
        gender: '女',
        age: 20,
        height: 165,
        bodyType: '苗条',
        arc: '从被动承受家族压力的淡然闺秀，到坚定选择所爱、主动反抗父权安排',
        hairstyle: '高髻云鬓，乌黑如墨，斜插一支白玉步摇，长及腰际',
      },
      images: [
        { id: '1', name: '三视图', hasImage: true },
        { id: '2', name: '情绪表', hasImage: false },
        { id: '3', name: '素白寝衣（闺阁）', hasImage: false },
        { id: '4', name: '朱红襦裙+墨绿大袖衫（日常）', hasImage: false },
      ],
      versions: [
        { id: 'v1', name: 'V01', isCurrent: false },
        { id: 'v2', name: 'V02', isCurrent: true },
        { id: 'v3', name: 'V03', isCurrent: false },
        { id: 'v4', name: 'V04', isCurrent: false },
        { id: 'v5', name: 'V05', isCurrent: false },
      ],
    },
  },
  {
    id: '2',
    code: 'C01',
    kind: 'character',
    name: '罗辑',
    description: '主角·人类·男·青年',
    hasImage: false,
    totalVersions: 3,
    currentVersion: 2,
  },
  {
    id: '3',
    code: 'C01',
    kind: 'character',
    name: '罗辑',
    description: '主角·人类·男·青年',
    imageUrl: '/character-luoji.jpg',
    hasImage: true,
    totalVersions: 3,
    currentVersion: 3,
  },
  {
    id: '4',
    code: 'C01',
    kind: 'character',
    name: '罗辑',
    description: '主角·人类·男·青年',
    imageUrl: '/character-luoji.jpg',
    hasImage: true,
    totalVersions: 3,
    currentVersion: 3,
  },
];

// 示例场景数据
export const sampleScenes: Scene[] = [
  {
    id: 's1',
    code: 'S01',
    kind: 'scene',
    name: '林深家·客厅',
    description: '内景·现代·日',
    hasImage: false,
    totalVersions: 2,
    currentVersion: 0,
  },
  {
    id: 's2',
    code: 'S02',
    kind: 'scene',
    name: '湖边·石桥',
    description: '外景·古代·日',
    hasImage: true,
    totalVersions: 3,
    currentVersion: 1,
  },
];

// 示例道具数据
export const sampleProps: Prop[] = [
  {
    id: 'p1',
    code: 'P01',
    kind: 'prop',
    name: '青铜剑',
    description: '武器·古代',
    hasImage: false,
    totalVersions: 2,
    currentVersion: 0,
  },
  {
    id: 'p2',
    code: 'P02',
    kind: 'prop',
    name: '白玉步摇',
    description: '饰品·古代',
    hasImage: true,
    totalVersions: 3,
    currentVersion: 2,
  },
];

// 按 tab 取对应类型的资产（联合类型，供父级按 kind 收窄分发）
export function getSampleAssets(kind: Asset['kind']): Asset[] {
  switch (kind) {
    case 'character':
      return sampleCharacters;
    case 'scene':
      return sampleScenes;
    case 'prop':
      return sampleProps;
    default:
      return [];
  }
}