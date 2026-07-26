// 创作中心选项配置 - 参考老前端 DashboardPage.tsx

// ==================== 1. 内容类型选项 ====================
export interface ContentTypeOption {
  key: string;
  label: string;
  category: string;
  categoryLabel: string;
  description?: string;
  defaultAspectRatio: string;
  defaultEpisodeCount: number;
  defaultDuration: number;
  defaultVisualStyle: string;
}

export const CONTENT_TYPE_OPTIONS: ContentTypeOption[] = [
  // 剧情内容
  { key: 'ai_short_drama', label: 'AI短剧', category: 'scripted', categoryLabel: '剧情内容', defaultAspectRatio: '9:16', defaultEpisodeCount: 12, defaultDuration: 120, defaultVisualStyle: '电影感写实' },
  { key: 'mythology_drama', label: '神话故事', category: 'scripted', categoryLabel: '剧情内容', defaultAspectRatio: '9:16', defaultEpisodeCount: 12, defaultDuration: 120, defaultVisualStyle: '神话史诗' },
  { key: 'historical_drama', label: '古装剧', category: 'scripted', categoryLabel: '剧情内容', defaultAspectRatio: '9:16', defaultEpisodeCount: 24, defaultDuration: 180, defaultVisualStyle: '古装剧质感' },
  { key: 'wuxia_drama', label: '武侠剧', category: 'scripted', categoryLabel: '剧情内容', defaultAspectRatio: '9:16', defaultEpisodeCount: 20, defaultDuration: 150, defaultVisualStyle: '武侠江湖' },
  { key: 'xianxia_drama', label: '仙侠剧', category: 'scripted', categoryLabel: '剧情内容', defaultAspectRatio: '9:16', defaultEpisodeCount: 30, defaultDuration: 150, defaultVisualStyle: '仙侠玄幻' },

  // 动画番剧
  { key: 'anime_2d', label: '2D日漫', category: 'animation', categoryLabel: '动画番剧', defaultAspectRatio: '9:16', defaultEpisodeCount: 12, defaultDuration: 120, defaultVisualStyle: '2D日漫' },
  { key: 'anime_chinese', label: '国漫动画', category: 'animation', categoryLabel: '动画番剧', defaultAspectRatio: '9:16', defaultEpisodeCount: 16, defaultDuration: 150, defaultVisualStyle: '国漫动画' },
  { key: 'pixar_style', label: '皮克斯风格', category: 'animation', categoryLabel: '动画番剧', defaultAspectRatio: '9:16', defaultEpisodeCount: 8, defaultDuration: 120, defaultVisualStyle: '皮克斯风格' },
  { key: 'popmart_style', label: '泡泡玛特风', category: 'animation', categoryLabel: '动画番剧', defaultAspectRatio: '9:16', defaultEpisodeCount: 6, defaultDuration: 60, defaultVisualStyle: '泡泡玛特风格' },

  // 古风历史
  { key: 'tang_dynasty', label: '盛唐美学', category: 'historical', categoryLabel: '古风历史', defaultAspectRatio: '9:16', defaultEpisodeCount: 10, defaultDuration: 120, defaultVisualStyle: '盛唐美学' },
  { key: 'chinese_aesthetics', label: '中式美学', category: 'historical', categoryLabel: '古风历史', defaultAspectRatio: '9:16', defaultEpisodeCount: 10, defaultDuration: 120, defaultVisualStyle: '中式美学' },
  { key: 'ink_wash', label: '古风水墨', category: 'historical', categoryLabel: '古风历史', defaultAspectRatio: '9:16', defaultEpisodeCount: 8, defaultDuration: 90, defaultVisualStyle: '古风水墨' },

  // 东方幻想
  { key: 'sci_fi', label: '星际科幻', category: 'oriental_fantasy', categoryLabel: '东方幻想', defaultAspectRatio: '9:16', defaultEpisodeCount: 12, defaultDuration: 120, defaultVisualStyle: '星际科幻' },
  { key: 'cyberpunk', label: '赛博朋克', category: 'oriental_fantasy', categoryLabel: '东方幻想', defaultAspectRatio: '9:16', defaultEpisodeCount: 10, defaultDuration: 120, defaultVisualStyle: '赛博朋克' },

  // 品牌/营销
  { key: 'brand_story', label: '品牌故事', category: 'brand', categoryLabel: '品牌传播', defaultAspectRatio: '9:16', defaultEpisodeCount: 3, defaultDuration: 60, defaultVisualStyle: '电影感写实' },
  { key: 'marketing', label: '营销转化', category: 'marketing', categoryLabel: '营销转化', defaultAspectRatio: '9:16', defaultEpisodeCount: 3, defaultDuration: 45, defaultVisualStyle: '电影感写实' },
  { key: 'commerce', label: '电商种草', category: 'commerce', categoryLabel: '电商种草', defaultAspectRatio: '9:16', defaultEpisodeCount: 5, defaultDuration: 30, defaultVisualStyle: '日系清新' },

  // 文旅/城市
  { key: 'tourism', label: '景区文旅', category: 'tourism', categoryLabel: '景区文旅', defaultAspectRatio: '9:16', defaultEpisodeCount: 5, defaultDuration: 90, defaultVisualStyle: '电影感写实' },
  { key: 'city_publicity', label: '城市文旅', category: 'publicity', categoryLabel: '城市文旅', defaultAspectRatio: '9:16', defaultEpisodeCount: 4, defaultDuration: 120, defaultVisualStyle: '电影感写实' },

  // 其他垂直领域
  { key: 'presenter', label: '数字人口播', category: 'presenter', categoryLabel: '数字人口播', defaultAspectRatio: '9:16', defaultEpisodeCount: 1, defaultDuration: 60, defaultVisualStyle: '电影感写实' },
  { key: 'education', label: '知识课程', category: 'education', categoryLabel: '知识课程', defaultAspectRatio: '16:9', defaultEpisodeCount: 10, defaultDuration: 300, defaultVisualStyle: '电影感写实' },
  { key: 'documentary', label: '纪实人物', category: 'documentary', categoryLabel: '纪实人物', defaultAspectRatio: '9:16', defaultEpisodeCount: 6, defaultDuration: 180, defaultVisualStyle: '年代质感' },
  { key: 'music_video', label: '音乐影像', category: 'music', categoryLabel: '音乐影像', defaultAspectRatio: '9:16', defaultEpisodeCount: 1, defaultDuration: 240, defaultVisualStyle: '电影感写实' },
];

export const CATEGORY_LABELS: Record<string, string> = {
  scripted: '剧情内容',
  animation: '动画番剧',
  historical: '古风历史',
  oriental_fantasy: '东方幻想',
  brand: '品牌传播',
  marketing: '营销转化',
  commerce: '电商种草',
  tourism: '景区文旅',
  publicity: '城市文旅',
  presenter: '数字人口播',
  education: '知识课程',
  documentary: '纪实人物',
  music: '音乐影像',
  broadcast: '栏目包装',
};

// ==================== 2. 视觉风格选项 ====================
export interface VisualStyleOption {
  key: string;
  label: string;
  description: string;
  recommendedPalette: string;
}

export const VISUAL_STYLE_OPTIONS: VisualStyleOption[] = [
  { key: 'cinematic_realism', label: '电影感写实', description: '侧逆暖光·f/2.8·自然饱和·稳定叙事', recommendedPalette: 'warm_gold' },
  { key: 'neo_noir', label: '新黑色电影', description: '低角度逆光+霓虹·高对比·蓝青+琥珀', recommendedPalette: 'cool_blue' },
  { key: 'japanese_fresh', label: '日系清新', description: '大面积柔光·低对比·低饱和·静态留白', recommendedPalette: 'green_nature' },
  { key: 'hongkong_retro', label: '港风复古', description: '霓虹灯管·高对比·红金绿撞色·手持微晃', recommendedPalette: 'neon_hk' },
  { key: 'tang_aesthetics', label: '盛唐美学', description: '烛光暖光·中对比·朱红金墨绿·缓慢推轨', recommendedPalette: 'tang_red' },
  { key: 'chinese_aesthetics', label: '中式美学', description: '留白构图·宋式青绿·木石竹纸·克制东方光影', recommendedPalette: 'chinese_elegant' },
  { key: 'cyberpunk', label: '赛博朋克', description: '全息+霓虹+雨夜·极高对比·紫蓝品红', recommendedPalette: 'purple_night' },
  { key: 'ink_wash', label: '古风水墨', description: '大面积柔光·极低对比·黑白灰+单色点缀', recommendedPalette: 'bw_minimal' },
  { key: 'anime_style', label: '日漫风格', description: '赛璐珞着色·高饱和·清晰轮廓·动态线条·速度感', recommendedPalette: 'anime_bright' },
  { key: 'myth_epic', label: '神话史诗', description: '淡蓝神光·金色仪式·神话空间层级·法术与神器连续', recommendedPalette: 'myth_blue' },
  { key: 'anime_2d', label: '2D日漫', description: '严格二维线稿·赛璐珞硬边阴影·角色层/背景层分离', recommendedPalette: 'anime_cel' },
  { key: 'chinese_anime', label: '国漫动画', description: '东方审美·清晰线稿·国风纹样·角色层/背景层分离', recommendedPalette: 'chinese_gold' },
  { key: 'sci_fi', label: '星际科幻', description: '深空蓝冷调·星舰舱室结构·屏幕光·零重力科技感', recommendedPalette: 'deep_space' },
  { key: 'vintage', label: '年代质感', description: '低饱和生活光·旧物肌理·时代服化道·克制叙事', recommendedPalette: 'vintage_film' },
  { key: 'war_documentary', label: '战争纪实', description: '烟尘低饱和·手持运动·军装装备连续·战场空间清晰', recommendedPalette: 'war_dust' },
  { key: 'costume_drama', label: '古装剧质感', description: '古代礼仪空间·服饰纹样·烛光与自然光·朝代边界', recommendedPalette: 'costume_gold' },
  { key: 'wuxia', label: '武侠江湖', description: '山水客栈·竹林古道·兵器动作线·侠义冷暖对比', recommendedPalette: 'wuxia_green' },
  { key: 'xianxia', label: '仙侠玄幻', description: '仙山云雾·灵力光效·宗门空间·法器灵兽连续', recommendedPalette: 'xianxia_cloud' },
  { key: 'pixar', label: '皮克斯风格', description: '温润材质·柔和光·圆润造型·暖调子·微表情丰富', recommendedPalette: 'pixar_warm' },
  { key: 'popmart', label: '泡泡玛特风格', description: '软胶质感·粉嫩糖果色·大眼萌系·盲盒潮玩·治愈感', recommendedPalette: 'popmart_pink' },
];

// ==================== 3. 画面规格选项 ====================
export interface AspectRatioOption {
  value: string;
  label: string;
  usage: string;
  shape: 'portrait' | 'landscape' | 'square' | 'poster' | 'classic' | 'cinema';
}

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  { value: '9:16', label: '竖屏短视频', usage: '抖音 / 快手 / TikTok / 红果 / 视频号', shape: 'portrait' },
  { value: '16:9', label: '横屏主片', usage: '电视台 / 长视频平台 / YouTube / 官网', shape: 'landscape' },
  { value: '1:1', label: '方形社媒', usage: '社媒通用 / 信息流 / 封面衍生', shape: 'square' },
  { value: '3:4', label: '竖版图文', usage: '小红书 / 海报 / 人物展示 / 图文内容', shape: 'poster' },
  { value: '4:3', label: '传统横幅', usage: '课件 / 传统电视 / 档案素材 / 演示屏', shape: 'classic' },
  { value: '21:9', label: '宽银幕', usage: '电影感主视觉 / 展厅 / 品牌大片', shape: 'cinema' },
];

export interface FormatPreset {
  label: string;
  aspectRatio: string;
  episodeCount: number;
  duration: number;
  description: string;
}

export const FORMAT_PRESETS: FormatPreset[] = [
  { label: '竖屏短剧 12集·120s', aspectRatio: '9:16', episodeCount: 12, duration: 120, description: '标准短剧格式，适合抖音/快手' },
  { label: '竖屏短剧 24集·90s', aspectRatio: '9:16', episodeCount: 24, duration: 90, description: '快节奏短剧，适合快节奏平台' },
  { label: '竖屏精品 8集·180s', aspectRatio: '9:16', episodeCount: 8, duration: 180, description: '精品短剧，适合红果/番茄' },
  { label: '横屏网剧 20集·300s', aspectRatio: '16:9', episodeCount: 20, duration: 300, description: '横屏网剧，适合长视频平台' },
  { label: '数字人口播 1集·60s', aspectRatio: '9:16', episodeCount: 1, duration: 60, description: '单人口播，适合短视频营销' },
  { label: '电商种草 5集·30s', aspectRatio: '9:16', episodeCount: 5, duration: 30, description: '快节奏种草，适合电商带货' },
  { label: '品牌故事 3集·60s', aspectRatio: '9:16', episodeCount: 3, duration: 60, description: '品牌短片，适合品牌传播' },
  { label: '知识课程 10集·300s', aspectRatio: '16:9', episodeCount: 10, duration: 300, description: '横屏课程，适合教育平台' },
  { label: '自定义规格', aspectRatio: '9:16', episodeCount: 12, duration: 120, description: '自定义集数和单集时长' },
];

// ==================== 4. AI模型选项 ====================
export interface AIModelOption {
  key: string;
  label: string;
  provider: string;
  description: string;
  features: string[];
  recommended: boolean;
}

export const AI_MODEL_OPTIONS: AIModelOption[] = [
  {
    key: 'claude',
    label: 'Claude 4.8',
    provider: 'Anthropic',
    description: '最适合剧本创作和复杂叙事',
    features: ['擅长长文本', '逻辑严谨', '角色塑造好', '剧情连贯性强'],
    recommended: true,
  },
  {
    key: 'gpt4o',
    label: 'GPT-4o',
    provider: 'OpenAI',
    description: '通用能力强，创意丰富',
    features: ['创意能力强', '多语言好', '知识面广泛', '响应快速'],
    recommended: false,
  },
  {
    key: 'gpt4o_mini',
    label: 'GPT-4o mini',
    provider: 'OpenAI',
    description: '高性价比，适合快速迭代',
    features: ['成本低', '速度快', '日常够用', '适合测试'],
    recommended: false,
  },
  {
    key: 'gemini',
    label: 'Gemini 2.5',
    provider: 'Google',
    description: '多模态能力强',
    features: ['多模态', 'Google生态', '中文不错', '长上下文'],
    recommended: false,
  },
];

// ==================== 辅助函数 ====================
export function getContentTypeByKey(key: string): ContentTypeOption | undefined {
  return CONTENT_TYPE_OPTIONS.find(opt => opt.key === key);
}

export function getVisualStyleByKey(key: string): VisualStyleOption | undefined {
  return VISUAL_STYLE_OPTIONS.find(opt => opt.key === key);
}

export function getAspectRatioByValue(value: string): AspectRatioOption | undefined {
  return ASPECT_RATIO_OPTIONS.find(opt => opt.value === value);
}

export function getAIModelByKey(key: string): AIModelOption | undefined {
  return AI_MODEL_OPTIONS.find(opt => opt.key === key);
}

// 按分类组织内容类型
export function getContentTypesByCategory(): Record<string, ContentTypeOption[]> {
  return CONTENT_TYPE_OPTIONS.reduce((acc, opt) => {
    if (!acc[opt.category]) acc[opt.category] = [];
    acc[opt.category].push(opt);
    return acc;
  }, {} as Record<string, ContentTypeOption[]>);
}
