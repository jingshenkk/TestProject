// P3-4：后期制作工作台 mock 数据与本地类型集中。
// 注：此处结构为后期页独有（音频补修 / 配乐 / 精剪 / 交付四阶段工作台），
// 与分镜/视频生成页的精简结构不同，故独立定义于本模块。
// 后端 API 接入前，页面用这些样例数据离线渲染。

export interface PostStatus {
  project_id: number;
  project_name: string;
  total_shots: number;
  selected_clips: number;
  missing_review: string[];
  missing_video_files: string[];
  completed_missing_video_files: Array<{ video_asset_id: number; shot_id: string | null; file_path: string }>;
  ready_for_export: boolean;
  ready_for_render: boolean;
  ffmpeg_available: boolean;
  post_dir: string;
}

export type StageStatus = 'ready' | 'blocked' | 'pending' | 'in_progress' | 'completed';

export interface StageItem {
  key: string;
  label: string;
  description: string;
  status: StageStatus;
  item_count: number;
  artifact_count: number;
  generated_files: string[];
  workspace_status: string;
  prepared_at: string;
  completed_at: string;
  notes: string;
  blockers: unknown[];
  next_actions: string[];
}

interface CueBase {
  episode: number;
  shot_id: string;
  start_sec: number;
  end_sec: number;
  duration_sec: number;
}

export interface AudioFile {
  name: string;
  path: string;
  size_bytes: number;
  ext: string;
}

export interface AudioProviderStatus {
  label: string;
  configured: boolean;
  action: string;
  provider?: string;
  model?: string;
  model_options?: string[];
  sfx_model?: string;
  sfx_supported?: boolean;
  path?: string;
}

export interface DialogueCue extends CueBase {
  dialogue: string;
  spoken_text?: string;
  raw_dialogue?: string;
  performance_note?: string;
  speaker: string;
  voice_tone: string;
  needs_repair: boolean;
  issue?: string;
  is_spoken?: boolean;
  generated?: boolean;
  generated_file?: AudioFile | null;
}

export interface SfxCue extends CueBase {
  sfx: string;
  source?: 'explicit' | 'inferred' | 'none';
  confidence?: 'high' | 'medium' | '';
  inferred_from?: string[];
  generated?: boolean;
  generated_file?: AudioFile | null;
}

export interface DialogueIssue extends CueBase {
  raw_dialogue: string;
  dialogue: string;
  spoken_text: string;
  performance_note: string;
  speaker: string;
  issue: string;
  message: string;
  is_spoken: boolean;
}

export interface VoiceProfile {
  char_id: string;
  name: string;
  role: string;
  voice_tone: string;
}

export interface MusicSegment extends CueBase {
  mood: string;
  narrative_beat: string;
  prompt: string;
  generated_file?: AudioFile | null;
}

export interface TimelineItem extends CueBase {
  decision: string;
  video_asset_id: number;
  source_path: string;
  dialogue: string;
  sfx: string;
  bgm_mood: string;
}

export interface Workbench {
  status: PostStatus;
  stages: StageItem[];
  workspace: {
    artifacts: Array<{
      id: string;
      stage: string;
      stage_label: string;
      type: string;
      name: string;
      path: string;
      size_bytes: number;
      notes: string;
      created_at: string;
    }>;
    stages: Record<string, { status: string; generated_files?: string[]; notes?: string }>;
    updated_at: string;
  };
  audio_capabilities: Record<string, AudioProviderStatus>;
  audio_repair: {
    dialogue_count: number;
    dialogue_issue_count?: number;
    sfx_count: number;
    manual_artifact_count?: number;
    can_complete?: boolean;
    voice_profiles: VoiceProfile[];
    dialogue_cues: DialogueCue[];
    dialogue_issues?: DialogueIssue[];
    sfx_cues: SfxCue[];
  };
  music: {
    mood_counts: Array<{ mood: string; count: number }>;
    cues: Array<CueBase & { mood: string; narrative_beat: string }>;
  };
  post_edit: {
    timeline: TimelineItem[];
    selected_clips: number;
    missing_items: string[];
    stale_missing_video_files: Array<{ video_asset_id: number; shot_id: string | null; file_path: string }>;
    ready_for_render: boolean;
  };
  delivery: {
    files: string[];
    ready_for_export: boolean;
    ffmpeg_available: boolean;
    external_finishing: string[];
  };
}

export interface AudioStatus {
  audio_file_count: number;
  dialogue?: { completed: number; total: number; issues: number };
  sfx?: { completed: number; total: number };
  music?: { completed: number; total: number };
  mix?: { can_mix: boolean; blockers: string[]; output_path?: string };
}

export interface ExportResult {
  success: boolean;
  message: string;
  export_dir: string;
  zip_path: string;
  final_video_path: string;
  render_error: string;
  mixed_audio_path?: string;
  manifest: {
    timeline_duration_sec: number;
    timeline: TimelineItem[];
  };
}

const PROJECT_NAME = '三体2-终极之战';

export const mockWorkbench: Workbench = {
  status: {
    project_id: 1,
    project_name: PROJECT_NAME,
    total_shots: 88,
    selected_clips: 12,
    missing_review: [],
    missing_video_files: ['E02_S04'],
    completed_missing_video_files: [],
    ready_for_export: false,
    ready_for_render: false,
    ffmpeg_available: true,
    post_dir: `${PROJECT_NAME}/post`,
  },
  stages: [
    {
      key: 'audio_repair',
      label: '音频补修',
      description: '对白、声线、环境音与动作音效的 AI 生成与补修。',
      status: 'in_progress',
      item_count: 12,
      artifact_count: 0,
      generated_files: [],
      workspace_status: '进行中',
      prepared_at: '2026-07-24 10:21',
      completed_at: '',
      notes: '对白生成中，音效待生成',
      blockers: [],
      next_actions: ['生成全部对白', '生成全部音效'],
    },
    {
      key: 'music',
      label: '配乐制作',
      description: 'AI 生成跨镜连续配乐，按情绪曲线分段。',
      status: 'pending',
      item_count: 5,
      artifact_count: 0,
      generated_files: [],
      workspace_status: '待准备',
      prepared_at: '',
      completed_at: '',
      notes: '等待音频补修完成后准备',
      blockers: [],
      next_actions: ['生成本阶段文件'],
    },
    {
      key: 'post_edit',
      label: '精剪调色',
      description: '审核通过镜头进入最终剪辑决策表与字幕草稿。',
      status: 'ready',
      item_count: 12,
      artifact_count: 0,
      generated_files: ['final_cut.edl'],
      workspace_status: '就绪',
      prepared_at: '2026-07-23 18:40',
      completed_at: '',
      notes: '时间线已对齐',
      blockers: [],
      next_actions: ['标记完成'],
    },
    {
      key: 'delivery',
      label: '成片交付',
      description: '生成 ZIP、剪辑表、字幕、配乐 Cue 与平台外精剪清单。',
      status: 'blocked',
      item_count: 4,
      artifact_count: 0,
      generated_files: [],
      workspace_status: '阻塞',
      prepared_at: '',
      completed_at: '',
      notes: '等待精剪调色完成',
      blockers: ['post_edit 未完成'],
      next_actions: [],
    },
  ],
  workspace: {
    artifacts: [],
    stages: {},
    updated_at: '2026-07-24 10:21',
  },
  audio_capabilities: {
    cosyvoice: { label: 'CosyVoice', configured: true, action: '已接入，可生成中文对白', model: 'cosyvoice-v2' },
    elevenlabs: { label: 'ElevenLabs', configured: true, action: '已接入多语言 TTS', provider: 'shengsuan', model: 'TTS', sfx_supported: false },
    suno: { label: 'Suno', configured: false, action: '请先配置 SUNO_API_KEY + SUNO_BASE_URL', model: 'chirp-v4-5' },
    ffmpeg: { label: 'FFmpeg', configured: true, action: '已检测，可混音/合成' },
  },
  audio_repair: {
    dialogue_count: 12,
    dialogue_issue_count: 2,
    sfx_count: 8,
    voice_profiles: [
      { char_id: 'C01', name: '屈原', role: '主角', voice_tone: '沉稳男声 · 中低音' },
      { char_id: 'C02', name: '湘夫人', role: '女主', voice_tone: '清冷女声 · 气声' },
      { char_id: 'C03', name: '李公子', role: '配角', voice_tone: '年轻男声 · 明亮' },
    ],
    dialogue_cues: [
      { episode: 2, shot_id: 'E02_S01', start_sec: 0, end_sec: 4.5, duration_sec: 4.5, dialogue: '这橘子，熟透了就该落下。', spoken_text: '这橘子，熟透了就该落下。', raw_dialogue: '这橘子，熟透了就该落下。', speaker: '屈原', voice_tone: '沉稳男声 · 中低音', needs_repair: false, is_spoken: true, generated: true, generated_file: { name: 'E02_S01_dialogue.wav', path: 'post/audio/dialogue/E02_S01.wav', size_bytes: 88200, ext: 'wav' } },
      { episode: 2, shot_id: 'E02_S02', start_sec: 4.5, end_sec: 9, duration_sec: 4.5, dialogue: '嗯，落叶无声。', spoken_text: '嗯，落叶无声。', raw_dialogue: '嗯，落叶无声。', speaker: '湘夫人', voice_tone: '清冷女声 · 气声', needs_repair: false, is_spoken: true, generated: false, generated_file: null },
      { episode: 2, shot_id: 'E02_S03', start_sec: 9, end_sec: 13, duration_sec: 4, dialogue: '风吹过橘林。', spoken_text: '风吹过橘林。', raw_dialogue: '风吹过橘林。', speaker: '屈原', voice_tone: '沉稳男声 · 中低音', needs_repair: false, is_spoken: true, generated: false, generated_file: null },
      { episode: 2, shot_id: 'E02_S05', start_sec: 13, end_sec: 17, duration_sec: 4, dialogue: '我自长夜来。', spoken_text: '我自长夜来。', raw_dialogue: '我自长夜来。', speaker: '李公子', voice_tone: '年轻男声 · 明亮', needs_repair: false, is_spoken: true, generated: false, generated_file: null },
    ],
    dialogue_issues: [
      { episode: 2, shot_id: 'E02_S07', start_sec: 0, end_sec: 3, duration_sec: 3, raw_dialogue: '（湘夫人低头不语）', dialogue: '（湘夫人低头不语）', spoken_text: '', performance_note: '低头不语，目光垂落', speaker: '湘夫人', issue: '仅表演提示', message: '空角色台词，需人工补成真实台词或上传人工修补', is_spoken: false },
    ],
    sfx_cues: [
      { episode: 2, shot_id: 'E02_S01', start_sec: 0, end_sec: 4.5, duration_sec: 4.5, sfx: '落叶轻响、微风穿林', source: 'explicit', confidence: 'high', generated: false, generated_file: null },
      { episode: 2, shot_id: 'E02_S03', start_sec: 9, end_sec: 13, duration_sec: 4, sfx: '风声渐强、橘叶摩擦', source: 'inferred', confidence: 'medium', inferred_from: ['风吹过橘林'], generated: false, generated_file: null },
      { episode: 2, shot_id: 'E02_S05', start_sec: 13, end_sec: 17, duration_sec: 4, sfx: '脚步踩落叶', source: 'explicit', confidence: 'high', generated: false, generated_file: null },
    ],
  },
  music: {
    mood_counts: [
      { mood: '沉郁', count: 4 },
      { mood: '克制冷峻', count: 3 },
      { mood: '空灵', count: 2 },
      { mood: '张力', count: 1 },
    ],
    cues: [
      { episode: 2, shot_id: 'E02_S01', start_sec: 0, end_sec: 17, duration_sec: 17, mood: '沉郁', narrative_beat: '开场定调' },
    ],
  },
  post_edit: {
    timeline: [
      { episode: 2, shot_id: 'E02_S01', start_sec: 0, end_sec: 4.5, duration_sec: 4.5, decision: 'selected', video_asset_id: 201, source_path: 'render/E02_S01.mp4', dialogue: '这橘子，熟透了就该落下。', sfx: '落叶轻响', bgm_mood: '沉郁' },
      { episode: 2, shot_id: 'E02_S02', start_sec: 4.5, end_sec: 9, duration_sec: 4.5, decision: 'selected', video_asset_id: 202, source_path: 'render/E02_S02.mp4', dialogue: '嗯，落叶无声。', sfx: '—', bgm_mood: '克制冷峻' },
      { episode: 2, shot_id: 'E02_S03', start_sec: 9, end_sec: 13, duration_sec: 4, decision: 'passable', video_asset_id: 203, source_path: 'render/E02_S03.mp4', dialogue: '风吹过橘林。', sfx: '风声渐强', bgm_mood: '空灵' },
      { episode: 2, shot_id: 'E02_S05', start_sec: 13, end_sec: 17, duration_sec: 4, decision: 'pending', video_asset_id: 205, source_path: 'render/E02_S05.mp4', dialogue: '我自长夜来。', sfx: '脚步踩落叶', bgm_mood: '张力' },
    ],
    selected_clips: 12,
    missing_items: ['E02_S04 视频文件缺失'],
    stale_missing_video_files: [],
    ready_for_render: false,
  },
  delivery: {
    files: ['final_cut.edl', 'subtitles.srt', 'mix_plan.json', 'delivery_manifest.json'],
    ready_for_export: false,
    ffmpeg_available: true,
    external_finishing: ['达芬奇调色工程导出', '杜比全景声混录母版', 'Netflix Originals 交付规格校验'],
  },
};

export const mockAudioStatus: AudioStatus = {
  audio_file_count: 6,
  dialogue: { completed: 1, total: 12, issues: 2 },
  sfx: { completed: 0, total: 8 },
  music: { completed: 0, total: 5 },
  mix: { can_mix: false, blockers: ['对白尚未全部生成', '音效尚未生成'], output_path: '' },
};

export const mockMusicSegments: MusicSegment[] = [
  { episode: 2, shot_id: 'E02_S01', start_sec: 0, end_sec: 9, duration_sec: 9, mood: '沉郁', narrative_beat: '开场定调', prompt: '电影感写实，低调光，长焦凝视', generated_file: null },
  { episode: 2, shot_id: 'E02_S03', start_sec: 9, end_sec: 17, duration_sec: 8, mood: '空灵', narrative_beat: '情绪留白', prompt: '空灵管弦，慢起，呼吸感', generated_file: null },
  { episode: 2, shot_id: 'E02_S05', start_sec: 17, end_sec: 25, duration_sec: 8, mood: '张力', narrative_beat: '人物登场', prompt: '低频推进，暗涌张力', generated_file: null },
];

export const DEFAULT_SUNO_MODEL_OPTIONS = [
  { value: 'chirp-v3-5', label: 'Suno v3.5' },
  { value: 'chirp-v4', label: 'Suno v4' },
  { value: 'chirp-v4-5', label: 'Suno v4.5' },
  { value: 'chirp-v4-5-plus', label: 'Suno v4.5+' },
];

export function formatSunoModelLabel(model: string) {
  return DEFAULT_SUNO_MODEL_OPTIONS.find((option) => option.value === model)?.label || model;
}