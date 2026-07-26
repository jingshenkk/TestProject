// P3-4：分集列表与分集剧情 mock 集中

export interface Episode {
  id: number;
  title: string;
  status: 'completed' | 'pending';
}

export interface EpisodeScene {
  id: string;
  location: string;
  description: string;
}

export interface EpisodeContent {
  title: string;
  summary: string;
  scenes: EpisodeScene[];
}

export const episodes: Episode[] = [
  { id: 1, title: '被迫封神', status: 'completed' },
  { id: 2, title: '遇刺', status: 'completed' },
  { id: 3, title: '', status: 'pending' },
  { id: 4, title: '', status: 'pending' },
  { id: 5, title: '', status: 'pending' },
];

export const episodeContent: EpisodeContent = {
  title: '分集剧情简介',
  summary: '三体危机公开，全球进入文明级恐慌，联合国仓促启动面壁计划。大学社会学教授罗辑在完全不知情的情况下，被推到全球直播的任命现场，和另外三位声名显赫的候选人并列，瞬间成了全人类眼中的"救世主"。',
  scenes: [
    {
      id: 'sc-2-1',
      location: '第2集 | 场景一 | 深渊底部 | 深夜',
      description: '漆黑岩壁从两侧高耸入云，仅有一线天光从上方裂缝中透下，照亮谷底嶙峋的乱石。\n\n李飞趴在碎石之间，五指死死扣进石缝，挣扎着抬起满是血污的脸。\n\n李飞：（喘息）我不能……死在这里……\n他咳出一口鲜血，血液渗入石缝。石缝深处忽然透出微弱的金光。',
    },
  ],
};