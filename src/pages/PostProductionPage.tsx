import { useEffect, useState, type ComponentType } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Archive,
  Check,
  Clock,
  Download,
  FileText,
  Film,
  Upload,
  Zap,
  type LucideProps,
} from 'lucide-react';

// API 客户端骨架 —— 未来替换为真实 API 调用
const apiClient = {
  get: async (url: string) => {
    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 500));
    // 在实际实现中，这将是一个 fetch/axios 调用
    throw new Error('API 未连接：需要实现后端 API 集成');
  },
  post: async (url: string, data?: any) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    throw new Error('API 未连接：需要实现后端 API 集成');
  },
};

// 简单的 Toast 钩子
function useToast() {
  return {
    success: (message: string) => console.log('[Success]', message),
    error: (message: string) => console.error('[Error]', message),
  };
}

// 状态徽章组件
function StatusBadge({ status, label }: { status: string; label?: string }) {
  const STATUS_LABELS: Record<string, string> = {
    completed: '已完成',
    pass: '通过',
    done: '完成',
    generating: '生成中',
    running: '运行中',
    in_progress: '进行中',
    queued: '排队中',
    pending: '待处理',
    failed: '失败',
    reject: '拒绝',
    blocked: '阻塞',
    cancelled: '已取消',
    selected: '已选中',
    passable: '可过',
  };

  const STATUS_COLORS: Record<string, string> = {
    completed: 'bg-green-100 text-green-700',
    pass: 'bg-green-100 text-green-700',
    done: 'bg-green-100 text-green-700',
    generating: 'bg-blue-100 text-blue-700',
    running: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-blue-100 text-blue-700',
    queued: 'bg-yellow-100 text-yellow-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
    reject: 'bg-red-100 text-red-700',
    blocked: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-700',
    selected: 'bg-green-100 text-green-700',
    passable: 'bg-green-100 text-green-700',
  };

  const displayLabel = label || STATUS_LABELS[status] || status;
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {displayLabel}
    </span>
  );
}

interface PostStatus {
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

interface StageItem {
  key: string;
  label: string;
  description: string;
  status: 'ready' | 'blocked' | 'pending' | 'in_progress' | 'completed';
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

interface AudioFile {
  name: string;
  path: string;
  size_bytes: number;
  ext: string;
}

interface AudioProviderStatus {
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

interface Workbench {
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
    voice_profiles: Array<{ char_id: string; name: string; role: string; voice_tone: string }>;
    dialogue_cues: Array<
      CueBase & {
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
    >;
    dialogue_issues?: Array<
      CueBase & {
        raw_dialogue: string;
        dialogue: string;
        spoken_text: string;
        performance_note: string;
        speaker: string;
        issue: string;
        message: string;
        is_spoken: boolean;
      }
    >;
    sfx_cues: Array<
      CueBase & {
        sfx: string;
        source?: 'explicit' | 'inferred' | 'none';
        confidence?: 'high' | 'medium' | '';
        inferred_from?: string[];
        generated?: boolean;
        generated_file?: AudioFile | null;
      }
    >;
  };
  music: {
    mood_counts: Array<{ mood: string; count: number }>;
    cues: Array<CueBase & { mood: string; narrative_beat: string }>;
  };
  post_edit: {
    timeline: Array<
      CueBase & { decision: string; video_asset_id: number; source_path: string; dialogue: string; sfx: string; bgm_mood: string }
    >;
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

interface ExportResult {
  success: boolean;
  message: string;
  export_dir: string;
  zip_path: string;
  final_video_path: string;
  render_error: string;
  mixed_audio_path?: string;
  workbench?: Workbench;
  manifest: {
    timeline_duration_sec: number;
    timeline: Array<{
      episode: number;
      shot_id: string;
      start_sec: number;
      end_sec: number;
      duration_sec: number;
      decision: string;
      video_asset_id: number;
      source_path: string;
      dialogue: string;
      sfx: string;
      bgm_mood: string;
    }>;
  };
}

const stageIcons: Record<string, ComponentType<LucideProps>> = {
  audio_repair: Zap,
  music: Clock,
  post_edit: Film,
  delivery: Archive,
};

function stageTone(status: StageItem['status']) {
  if (status === 'completed') return { label: '完成', className: 'is-ready' };
  if (status === 'in_progress') return { label: '进行中', className: 'is-running' };
  if (status === 'ready') return { label: '就绪', className: 'is-ready' };
  if (status === 'blocked') return { label: '阻塞', className: 'is-warn' };
  return { label: '待准备', className: 'is-muted' };
}

function shortList(items: string[], limit = 6) {
  if (!items.length) return '无';
  const head = items.slice(0, limit).join('、');
  return items.length > limit ? `${head} 等 ${items.length} 项` : head;
}

const DEFAULT_SUNO_MODEL_OPTIONS = [
  { value: 'chirp-v3-5', label: 'Suno v3.5' },
  { value: 'chirp-v4', label: 'Suno v4' },
  { value: 'chirp-v4-5', label: 'Suno v4.5' },
  { value: 'chirp-v4-5-plus', label: 'Suno v4.5+' },
];

function formatSunoModelLabel(model: string) {
  return DEFAULT_SUNO_MODEL_OPTIONS.find((option) => option.value === model)?.label || model;
}

export default function PostProductionPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const [workbench, setWorkbench] = useState<Workbench | null>(null);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [busyStage, setBusyStage] = useState('');
  const [uploadingStage, setUploadingStage] = useState('');
  const [render, setRender] = useState(false);
  const [audioStatus, setAudioStatus] = useState<Record<string, any>>({});
  const [musicSegments, setMusicSegments] = useState<any[]>([]);
  const [genProvider, setGenProvider] = useState('cosyvoice');
  const [musicStyle, setMusicStyle] = useState('');
  const [musicInstruments, setMusicInstruments] = useState('');
  const [musicModel, setMusicModel] = useState('');
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);
  const [dialogueProgress, setDialogueProgress] = useState('');
  const [sfxProgress, setSfxProgress] = useState('');
  const [musicProgress, setMusicProgress] = useState('');
  const [mixLevels, setMixLevels] = useState({ dialogue: -6, sfx: -12, music: -18 });
  const [normalizing, setNormalizing] = useState(false);
  const toast = useToast();

  const loadWorkbench = async () => {
    try {
      const res = await apiClient.get(`/post/${projectId}/workbench`);
      setWorkbench((res as any).data);
    } catch (e: any) {
      toast.error(e?.userMessage || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadWorkbench();
  }, [id]);

  // ── Audio status polling ──
  const loadAudioStatus = async () => {
    try {
      const res = await apiClient.get(`/post/${projectId}/audio/status`);
      setAudioStatus((res as any).data);
    } catch {
      /* non-critical */
    }
  };
  const loadMusicSegments = async () => {
    try {
      const res = await apiClient.get(`/post/${projectId}/audio/music-segments`);
      setMusicSegments((res as any).data.segments || []);
    } catch {
      /* non-critical */
    }
  };
  useEffect(() => {
    if (id) {
      loadAudioStatus();
      loadMusicSegments();
    }
  }, [id]);

  // ── Audio Generation Handlers ──
  const handleGenDialogue = async () => {
    setDialogueProgress('生成中...');
    try {
      const res = await apiClient.post(`/post/${projectId}/audio/dialogue`, { provider: genProvider });
      toast.success((res as any).data.message || `对白生成完成: ${(res as any).data.succeeded}/${(res as any).data.total}`);
      await loadAudioStatus();
      await loadWorkbench();
    } catch (e: any) {
      toast.error(e?.userMessage || e.message);
    } finally {
      setDialogueProgress('');
    }
  };

  const handleGenSingleDialogue = async (shotId: string) => {
    try {
      await apiClient.post(
        `/post/${projectId}/audio/dialogue/${encodeURIComponent(shotId)}?provider=${encodeURIComponent(genProvider)}`
      );
      toast.success('对白生成完成');
      await loadAudioStatus();
      await loadWorkbench();
    } catch (e: any) {
      toast.error(e?.userMessage || e.message);
    }
  };

  const handleGenSFX = async () => {
    setSfxProgress('生成中...');
    try {
      const res = await apiClient.post(`/post/${projectId}/audio/sfx`);
      toast.success((res as any).data.message || `音效生成完成: ${(res as any).data.succeeded}/${(res as any).data.total}`);
      await loadAudioStatus();
      await loadWorkbench();
    } catch (e: any) {
      toast.error(e?.userMessage || e.message);
    } finally {
      setSfxProgress('');
    }
  };

  const handleGenSingleSFX = async (shotId: string) => {
    try {
      await apiClient.post(`/post/${projectId}/audio/sfx/${encodeURIComponent(shotId)}`);
      toast.success('音效生成完成');
      await loadAudioStatus();
      await loadWorkbench();
    } catch (e: any) {
      toast.error(e?.userMessage || e.message);
    }
  };

  const handleGenMusic = async () => {
    setMusicProgress('生成中（配乐需 20-60 秒/段）...');
    try {
      const res = await apiClient.post(`/post/${projectId}/audio/music`, {
        style: musicStyle,
        instruments: musicInstruments,
        model: musicModel,
      });
      toast.success((res as any).data.message || `配乐生成完成: ${(res as any).data.succeeded}/${(res as any).data.total}`);
      await loadAudioStatus();
      await loadMusicSegments();
      await loadWorkbench();
    } catch (e: any) {
      toast.error(e?.userMessage || e.message);
    } finally {
      setMusicProgress('');
    }
  };

  const handleGenSingleMusic = async (segIdx: number) => {
    try {
      await apiClient.post(`/post/${projectId}/audio/music/${segIdx}`, {
        style: musicStyle,
        instruments: musicInstruments,
        model: musicModel,
      });
      toast.success('配乐段生成完成');
      await loadAudioStatus();
      await loadMusicSegments();
    } catch (e: any) {
      toast.error(e?.userMessage || e.message);
    }
  };

  const handleMix = async () => {
    try {
      const res = await apiClient.post(`/post/${projectId}/audio/mix`, mixLevels);
      if (!(res as any).data.success) throw new Error((res as any).data.error || '混音失败');
      toast.success((res as any).data.message || '混音完成');
      if ((res as any).data.project_relative_output_path) setPreviewAudio((res as any).data.project_relative_output_path);
      await loadAudioStatus();
      await loadWorkbench();
    } catch (e: any) {
      toast.error(e?.userMessage || e.message);
    }
  };

  const handleNormalize = async () => {
    setNormalizing(true);
    try {
      const res = await apiClient.post(`/post/${projectId}/audio/normalize`);
      if (!(res as any).data.success) throw new Error((res as any).data.error || '响度均一化失败');
      toast.success((res as any).data.message || '响度均一化完成');
      await loadAudioStatus();
      await loadWorkbench();
    } catch (e: any) {
      toast.error(e?.userMessage || e.message);
    } finally {
      setNormalizing(false);
    }
  };

  const audioFileUrl = (path: string) => `/api/post/file?path=${encodeURIComponent(path)}`;

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await apiClient.post(`/post/${projectId}/export?render=${render}`);
      setResult((res as any).data);
      if ((res as any).data.workbench) setWorkbench((res as any).data.workbench);
      toast.success((res as any).data.message || '成片交付包已生成');
      await loadWorkbench();
    } catch (e: any) {
      toast.error(e?.userMessage || e.message);
    } finally {
      setExporting(false);
    }
  };

  const handlePrepareStage = async (stageKey: string) => {
    setBusyStage(stageKey);
    try {
      const res = await apiClient.post(`/post/${projectId}/stage/${stageKey}/prepare`);
      setWorkbench((res as any).data.workbench);
      toast.success(`${(res as any).data.stage_label}工作文件已生成`);
    } catch (e: any) {
      toast.error(e?.userMessage || e.message);
    } finally {
      setBusyStage('');
    }
  };

  const handleCompleteStage = async (stageKey: string) => {
    setBusyStage(stageKey);
    try {
      const res = await apiClient.post(`/post/${projectId}/stage/${stageKey}/status`, { status: 'completed' });
      setWorkbench((res as any).data.workbench);
      toast.success('阶段已标记完成');
    } catch (e: any) {
      toast.error(e?.userMessage || e.message);
    } finally {
      setBusyStage('');
    }
  };

  const handleUploadStage = async (stageKey: string, file?: File) => {
    if (!file) return;
    setUploadingStage(stageKey);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('artifact_type', 'uploaded');
      // 注意：这里需要实际实现 multipart/form-data 提交
      toast.error('文件上传需要实现后端 API 集成');
    } catch (e: any) {
      toast.error(e?.userMessage || e.message);
    } finally {
      setUploadingStage('');
    }
  };

  const renderPostTopbar = (readyForRender: boolean | null = null) => (
    <header className="flex flex-col gap-4 p-6 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
            POST WORKBENCH
          </span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">后期制作工作台</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">音频补修、配乐 Cue、精剪调色、交付包与最终合成</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={`/project/${id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          title="返回项目"
        >
          <ArrowLeft size={16} />
          返回项目
        </Link>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          Phase 5
        </span>
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            readyForRender === null
              ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              : readyForRender
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
          }`}
        >
          {readyForRender === null ? '读取中' : readyForRender ? '可合成' : '待补齐'}
        </span>
        <Link
          to={`/project/${id}/assets`}
          className="inline-flex items-center gap-1 ml-auto text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          资产库管理中心
          <ArrowRight size={14} />
        </Link>
      </div>
    </header>
  );

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 dark:bg-gray-900">
        {renderPostTopbar(null)}
        <section className="p-6" aria-label="后期制作工作台加载中">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-800" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-800" />
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-800" />
          </div>
        </section>
      </div>
    );
  }

  if (!workbench) {
    return (
      <div className="flex-1 bg-gray-50 dark:bg-gray-900">
        {renderPostTopbar(false)}
        <section className="p-6">
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400" />
              <span className="font-semibold text-yellow-800 dark:text-yellow-200">无法读取后期制作工作台</span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
              后期制作工作台数据暂未返回。请确认后端服务与项目后期台账可用后刷新页面。
            </p>
            <button
              type="button"
              onClick={loadWorkbench}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              刷新状态
            </button>
          </div>
        </section>
      </div>
    );
  }

  const { status } = workbench;
  const downloadUrl = result?.zip_path ? `/api/post/download?path=${encodeURIComponent(result.zip_path)}` : '';
  const stageByKey = Object.fromEntries(workbench.stages.map((stage) => [stage.key, stage]));
  const fileUrl = (path: string) => `/api/post/file?path=${encodeURIComponent(path)}`;
  const artifactsFor = (stageKey: string) => workbench.workspace.artifacts.filter((artifact) => artifact.stage === stageKey);
  const capabilities = workbench.audio_capabilities || {};
  const dialogueProvider = genProvider === 'elevenlabs' ? capabilities.elevenlabs : capabilities.cosyvoice;
  const dialogueProviderReady = !!dialogueProvider?.configured;
  const sfxReady = !!capabilities.elevenlabs?.configured && capabilities.elevenlabs?.sfx_supported !== false;
  const musicReady = !!capabilities.suno?.configured;
  const defaultMusicModel = capabilities.suno?.model || '';
  const musicModelChoices = Array.from(
    new Set(
      [
        ...((Array.isArray(capabilities.suno?.model_options) ? capabilities.suno.model_options : []) as string[]),
        ...DEFAULT_SUNO_MODEL_OPTIONS.map((option) => option.value),
        ...(musicModel ? [musicModel] : []),
      ].filter(Boolean)
    )
  );
  const ffmpegReady = !!capabilities.ffmpeg?.configured;
  const audioFileCount = Number(audioStatus.audio_file_count || 0);
  const mixCanRun = !!audioStatus.mix?.can_mix;
  const mixBlockerText = (audioStatus.mix?.blockers || []).join('；');
  const mixPreviewPath = previewAudio || audioStatus.mix?.output_path || '';

  const renderAudioPlayer = (file?: AudioFile | null) => {
    if (!file?.path) {
      return <span className="text-xs text-gray-400 dark:text-gray-500">未生成</span>;
    }
    return (
      <div className="flex flex-col gap-1">
        <audio controls src={audioFileUrl(file.path)} className="w-full h-8" />
        <a href={fileUrl(file.path)} className="text-xs text-blue-600 hover:underline dark:text-blue-400">
          {file.name}
        </a>
      </div>
    );
  };

  const renderStageActions = (stageKey: string) => {
    const stage = stageByKey[stageKey];
    if (!stage) return null;
    const blocked = stage.blockers.length > 0;
    return (
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => handlePrepareStage(stageKey)}
          disabled={busyStage === stageKey}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <FileText size={14} />
          {busyStage === stageKey ? '生成中...' : '生成本阶段文件'}
        </button>
        <label
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 ${
            uploadingStage === stageKey ? 'opacity-60 pointer-events-none' : ''
          }`}
        >
          <Upload size={14} />
          {uploadingStage === stageKey ? '上传中...' : '上传产物'}
          <input type="file" className="hidden" onChange={(event) => handleUploadStage(stageKey, event.target.files?.[0])} />
        </label>
        <button
          type="button"
          onClick={() => handleCompleteStage(stageKey)}
          disabled={busyStage === stageKey || blocked}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
          title={blocked ? '存在阻塞项，暂不能标记完成' : '标记完成'}
        >
          <Check size={14} />
          标记完成
        </button>
      </div>
    );
  };

  const renderStageFiles = (stageKey: string) => {
    const stage = stageByKey[stageKey];
    const generated = stage?.generated_files || [];
    const artifacts = artifactsFor(stageKey);
    if (!generated.length && !artifacts.length) return null;
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {generated.map((path) => (
          <a
            key={path}
            href={fileUrl(path)}
            className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20"
          >
            <Download size={13} />
            {path.split(/[\\/]/).pop()}
          </a>
        ))}
        {artifacts.map((artifact) => (
          <a
            key={artifact.id}
            href={fileUrl(artifact.path)}
            className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20"
          >
            <Download size={13} />
            {artifact.name}
            <span className="px-1.5 py-0.5 text-xs text-gray-500 bg-gray-100 rounded dark:bg-gray-800 dark:text-gray-400">
              上传产物
            </span>
          </a>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-auto">
      {renderPostTopbar(status.ready_for_render)}

      <section className="p-6">
        {/* Stage Board */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {workbench.stages.map((stage, index) => {
            const tone = stageTone(stage.status);
            const StageIcon = stageIcons[stage.key] || Check;
            const deps: Record<string, string[]> = {
              audio_repair: [],
              music: ['audio_repair'],
              post_edit: ['audio_repair', 'music'],
              delivery: ['post_edit'],
            };
            const stageDeps = deps[stage.key] || [];
            const blockedBy = stageDeps.filter((depKey) => {
              const dep = workbench.stages.find((s) => s.key === depKey);
              return dep && dep.status !== 'completed';
            });
            return (
              <div
                key={stage.key}
                className={`p-4 rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 ${
                  tone.className === 'is-ready'
                    ? 'border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-800'
                    : tone.className === 'is-running'
                      ? 'border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800'
                      : tone.className === 'is-warn'
                        ? 'border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/10 dark:border-yellow-800'
                        : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`p-2 rounded-lg ${
                        tone.className === 'is-ready'
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                          : tone.className === 'is-running'
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : tone.className === 'is-warn'
                              ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      <StageIcon size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 dark:text-gray-500">{index + 1}</p>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{stage.label}</h3>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      tone.className === 'is-ready'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : tone.className === 'is-running'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : tone.className === 'is-warn'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {tone.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{stage.description}</p>
                {stageDeps.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                    依赖：{stageDeps.map((d) => workbench.stages.find((s) => s.key === d)?.label || d).join(' → 已完成')}
                  </p>
                )}
                {blockedBy.length > 0 && (
                  <p className="text-xs text-red-500 dark:text-red-400 mb-1">
                    阻塞：等待 {blockedBy.map((d) => workbench.stages.find((s) => s.key === d)?.label || d).join('、')} 完成
                  </p>
                )}
                <div className="mt-3 flex items-end justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-500">条目</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{stage.item_count}</span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  文件 {stage.generated_files.length} · 产物 {stage.artifact_count}
                </p>
              </div>
            );
          })}
        </div>

        {/* Readiness Card */}
        <div
          className={`p-4 rounded-xl border mb-6 ${
            status.ready_for_export
              ? 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800'
              : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              {status.ready_for_export ? (
                <Check size={16} className="text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400" />
              )}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {status.ready_for_export ? '后期链路已就绪，可以生成成片交付包' : '后期链路仍有未完成项'}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">交付目录：{status.post_dir}</p>
          </div>
          {!status.ready_for_export && (
            <p className="text-sm text-red-600 dark:text-red-400">
              未完成：{shortList([...status.missing_review, ...status.missing_video_files])}
            </p>
          )}
          {status.completed_missing_video_files.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              已忽略 {status.completed_missing_video_files.length} 条历史缺文件视频记录，不参与后期导出。
            </p>
          )}
        </div>

        {/* Capability Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            ['cosyvoice', '中文对白'],
            ['elevenlabs', '音效/多语言'],
            ['suno', 'AI 配乐'],
            ['ffmpeg', '混音/合成'],
          ].map(([key, label]) => {
            const item = capabilities[key];
            const ok = !!item?.configured;
            return (
              <div
                key={key}
                className={`p-4 rounded-xl border ${
                  ok
                    ? 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800'
                    : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{label}</span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      ok
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {ok ? '可用' : '未配置'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item?.label || key} · {ok ? '可执行生成/处理' : item?.action || '需配置后使用'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Workbench Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Primary Stack */}
          <div className="col-span-2 space-y-6">
            {/* Audio Repair Panel */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">音频补修</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    对白、声线、环境音和动作音效的 AI 生成与补修。
                    {audioStatus.dialogue && (
                      <span>
                        {' '}
                        · 已生成 {audioStatus.dialogue.completed}/{audioStatus.dialogue.total} 可合成对白
                      </span>
                    )}
                    {audioStatus.dialogue?.issues > 0 && <span> · 待核对白 {audioStatus.dialogue.issues}</span>}
                    {audioStatus.sfx && (
                      <span>
                        {' '}
                        · 已生成 {audioStatus.sfx.completed}/{audioStatus.sfx.total} 音效
                      </span>
                    )}
                  </p>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  可合成 {workbench.audio_repair.dialogue_count} · 待核 {workbench.audio_repair.dialogue_issue_count || 0} · 音效{' '}
                  {workbench.audio_repair.sfx_count}
                </span>
              </div>

              {/* AI 生成工具栏 */}
              <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4 dark:bg-gray-900">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI 生成</span>
                <select
                  value={genProvider}
                  onChange={(e) => setGenProvider(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                  <option value="cosyvoice">CosyVoice (中文)</option>
                  <option value="elevenlabs">ElevenLabs (多语言)</option>
                </select>
                <button
                  onClick={handleGenDialogue}
                  disabled={!!dialogueProgress || workbench.audio_repair.dialogue_count === 0 || !dialogueProviderReady}
                  title={!dialogueProviderReady ? dialogueProvider?.action || '当前对白生成服务未配置' : ''}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
                >
                  <Zap size={12} />
                  {dialogueProgress || `生成全部对白 (${workbench.audio_repair.dialogue_count})`}
                </button>
                <button
                  onClick={handleGenSFX}
                  disabled={!!sfxProgress || workbench.audio_repair.sfx_count === 0 || !sfxReady}
                  title={
                    !sfxReady
                      ? capabilities.elevenlabs?.sfx_supported === false
                        ? '当前 ElevenLabs 配置为多语言 TTS，不支持音效生成'
                        : capabilities.elevenlabs?.action || '当前音效生成服务未配置'
                      : ''
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
                >
                  <Zap size={12} />
                  {sfxProgress || `生成全部音效 (${workbench.audio_repair.sfx_count})`}
                </button>
                <button
                  onClick={handleNormalize}
                  disabled={normalizing || !ffmpegReady || audioFileCount === 0}
                  title={!ffmpegReady ? '未检测到 FFmpeg' : audioFileCount === 0 ? '还没有可处理的音频文件' : ''}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
                >
                  {normalizing ? '处理中...' : '响度均一化'}
                </button>
              </div>

              {!dialogueProviderReady && (
                <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                  当前 {dialogueProvider?.label || genProvider} 未配置，已禁用对白生成按钮：
                  {dialogueProvider?.action || '请先配置对应服务'}。
                </p>
              )}
              {capabilities.elevenlabs?.configured && capabilities.elevenlabs?.sfx_supported === false && (
                <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                  当前 ElevenLabs 已接入 {capabilities.elevenlabs.provider || 'shengsuan'} /{' '}
                  {capabilities.elevenlabs.model || 'TTS'}，可用于多语言对白；音效生成仍需官方 SFX 或独立音效模型。
                </p>
              )}
              {(workbench.audio_repair.dialogue_issue_count || 0) > 0 && (
                <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                  有 {workbench.audio_repair.dialogue_issue_count} 条对白只有表演/声音提示或空角色前缀，已移出 TTS
                  队列，需要先人工补成真实台词或上传人工修补产物。
                </p>
              )}

              {renderStageActions('audio_repair')}
              {renderStageFiles('audio_repair')}

              <div className="grid grid-cols-2 gap-4">
                {/* Dialogue Table */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg dark:border-gray-700">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900">
                        {['镜号', '对白', '声线', '音频', '操作'].map((h) => (
                          <th key={h} className="p-2 text-left font-medium text-gray-700 dark:text-gray-300">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {workbench.audio_repair.dialogue_cues.slice(0, 12).map((cue) => (
                        <tr key={cue.shot_id} className="border-t border-gray-100 dark:border-gray-800">
                          <td className="p-2 font-mono text-gray-500 dark:text-gray-400">{cue.shot_id}</td>
                          <td className="p-2 max-w-[240px]" title={cue.raw_dialogue || cue.dialogue}>
                            <div className="truncate text-gray-800 dark:text-gray-200">
                              {cue.spoken_text || cue.dialogue}
                            </div>
                            {cue.performance_note && (
                              <div className="text-gray-400 truncate dark:text-gray-500">表演：{cue.performance_note}</div>
                            )}
                          </td>
                          <td className={`p-2 ${cue.voice_tone ? 'text-gray-800 dark:text-gray-200' : 'text-red-500'}`}>
                            {cue.voice_tone || '未绑定'}
                          </td>
                          <td className="p-2">{renderAudioPlayer(cue.generated_file)}</td>
                          <td className="p-2">
                            <button
                              onClick={() => handleGenSingleDialogue(cue.shot_id)}
                              disabled={!dialogueProviderReady}
                              className="text-xs text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
                            >
                              {cue.generated ? '重生成' : '生成'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {workbench.audio_repair.dialogue_cues.length === 0 && (
                        <tr>
                          <td className="p-3 text-center text-gray-400 dark:text-gray-500" colSpan={5}>
                            暂无对白 Cue
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Voice Profiles & SFX */}
                <div className="space-y-3">
                  {workbench.audio_repair.voice_profiles.slice(0, 5).map((profile) => (
                    <div key={profile.char_id} className="p-3 bg-gray-50 rounded-lg dark:bg-gray-900">
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {profile.char_id} · {profile.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{profile.voice_tone}</p>
                    </div>
                  ))}
                  {workbench.audio_repair.voice_profiles.length === 0 && (
                    <p className="text-sm text-gray-400 dark:text-gray-500">暂无角色声线记录。</p>
                  )}
                  {!!workbench.audio_repair.dialogue_issues?.length && (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                      <p className="font-medium text-sm text-yellow-800 dark:text-yellow-200 mb-2">待人工修订对白</p>
                      {workbench.audio_repair.dialogue_issues.slice(0, 6).map((cue) => (
                        <div key={cue.shot_id} className="mb-2">
                          <div className="flex items-start justify-between gap-2 text-xs">
                            <span className="font-mono text-yellow-600 dark:text-yellow-400">{cue.shot_id}</span>
                            <span className="text-yellow-700 dark:text-yellow-300">{cue.message}</span>
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-1" title={cue.raw_dialogue}>
                            原字段：{cue.raw_dialogue}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* SFX cues */}
                  {workbench.audio_repair.sfx_cues.length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-900">
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2">音效队列</p>
                      {workbench.audio_repair.sfx_cues.slice(0, 6).map((cue) => (
                        <div key={cue.shot_id} className="mb-3">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-mono text-gray-500">{cue.shot_id}</span>
                            <span className="text-gray-700 dark:text-gray-300">
                              {cue.sfx}
                              {cue.source === 'inferred' && (
                                <span className="text-gray-400 dark:text-gray-500"> · 推导/{cue.confidence || 'medium'}</span>
                              )}
                            </span>
                            <button
                              onClick={() => handleGenSingleSFX(cue.shot_id)}
                              disabled={!sfxReady}
                              className="text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
                            >
                              {cue.generated ? '重生成' : '生成'}
                            </button>
                          </div>
                          <div className="mt-2">{renderAudioPlayer(cue.generated_file)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Music Panel */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">配乐制作</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    AI 生成跨镜连续配乐，按情绪曲线分段。
                    {audioStatus.music && (
                      <span>
                        {' '}
                        · 已生成 {audioStatus.music.completed}/{audioStatus.music.total} 段
                      </span>
                    )}
                  </p>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {workbench.music.cues.length} 条 Cue · {musicSegments.length} 情绪段
                </span>
              </div>

              {/* AI 配乐工具栏 */}
              <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4 dark:bg-gray-900">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">配乐</span>
                <input
                  type="text"
                  placeholder="风格 (如 电影感写实)"
                  value={musicStyle}
                  onChange={(e) => setMusicStyle(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg flex-1 min-w-[100px] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                />
                <input
                  type="text"
                  placeholder="乐器 (如 管弦乐)"
                  value={musicInstruments}
                  onChange={(e) => setMusicInstruments(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg flex-1 min-w-[100px] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                />
                <select
                  value={musicModel}
                  onChange={(e) => setMusicModel(e.target.value)}
                  disabled={!!musicProgress}
                  title="选择提交给 Suno 或代理服务的配乐模型"
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                  <option value="">
                    模型：默认{defaultMusicModel ? `（${formatSunoModelLabel(defaultMusicModel)}）` : ''}
                  </option>
                  {musicModelChoices.map((model) => (
                    <option key={model} value={model}>
                      {formatSunoModelLabel(model)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleGenMusic}
                  disabled={!!musicProgress || musicSegments.length === 0 || !musicReady}
                  title={!musicReady ? capabilities.suno?.action || '当前配乐生成服务未配置' : ''}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
                >
                  <Zap size={12} />
                  {musicProgress || `生成全部配乐 (${musicSegments.length} 段)`}
                </button>
              </div>
              {!musicReady && (
                <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                  Suno 未配置，已禁用 AI 配乐生成：{capabilities.suno?.action || '请先配置 SUNO_API_KEY + SUNO_BASE_URL'}。
                </p>
              )}

              {renderStageActions('music')}
              {renderStageFiles('music')}

              {/* Music segments */}
              {musicSegments.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {musicSegments.map((seg, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg dark:bg-gray-900">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {seg.start_sec}s - {seg.end_sec}s
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-500">{seg.duration_sec}s</span>
                        <button
                          onClick={() => handleGenSingleMusic(i)}
                          disabled={!musicReady}
                          className="text-xs text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
                        >
                          {seg.generated ? '重生成' : '生成'}
                        </button>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{seg.mood}</p>
                      {seg.narrative_beat && <p className="text-sm text-gray-600 dark:text-gray-400">{seg.narrative_beat}</p>}
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{seg.prompt}</p>
                      <div className="mt-2">{renderAudioPlayer(seg.generated_file)}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {workbench.music.mood_counts.map((item) => (
                  <span
                    key={item.mood}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full dark:bg-gray-700 dark:text-gray-300"
                  >
                    {item.mood} · {item.count}
                  </span>
                ))}
              </div>
            </div>

            {/* Mix Panel */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">混音</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">对白/音效/配乐三轨混音 + 响度标准化 (-16 LUFS)</p>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: '对白轨', key: 'dialogue', db: mixLevels.dialogue },
                  { label: '音效轨', key: 'sfx', db: mixLevels.sfx },
                  { label: '配乐轨', key: 'music', db: mixLevels.music },
                ].map((track) => (
                  <div key={track.key} className="p-3 bg-gray-50 rounded-lg dark:bg-gray-900">
                    <p
                      className={`text-sm font-medium ${
                        track.key === 'dialogue'
                          ? 'text-blue-600 dark:text-blue-400'
                          : track.key === 'sfx'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-purple-600 dark:text-purple-400'
                      }`}
                    >
                      {track.label}
                    </p>
                    <input
                      type="range"
                      min="-24"
                      max="0"
                      value={track.db}
                      onChange={(e) =>
                        setMixLevels((prev) => ({ ...prev, [track.key]: Number(e.target.value) }))
                      }
                      className="w-full mt-1"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{track.db} dB</p>
                  </div>
                ))}
              </div>
              <button
                onClick={handleMix}
                disabled={!ffmpegReady || !mixCanRun}
                title={
                  !ffmpegReady
                    ? '未检测到 FFmpeg，无法混音'
                    : !mixCanRun
                      ? mixBlockerText || '还没有可混音的音频文件'
                      : ''
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Zap size={14} /> 自动混音
              </button>
              {!mixCanRun && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-3">
                  混音暂不可用：{mixBlockerText || '还没有可混音的对白、音效或配乐文件'}。
                </p>
              )}
              {mixPreviewPath && (
                <div className="p-3 mt-4 bg-gray-50 rounded-lg dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    当前混音轨 · 会在导出 final_cut.mp4 时自动合入
                  </p>
                  <audio controls src={audioFileUrl(mixPreviewPath)} className="w-full mb-2" />
                  <a href={fileUrl(mixPreviewPath)} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                    下载 mixed_audio.wav
                  </a>
                </div>
              )}
            </div>

            {/* Timeline Panel */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">后期制作时间线</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">审核通过镜头会进入最终剪辑决策表和字幕草稿。</p>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {workbench.post_edit.selected_clips}/{status.total_shots} 镜
                </span>
              </div>
              {renderStageActions('post_edit')}
              {renderStageFiles('post_edit')}
              <div className="overflow-x-auto border border-gray-200 rounded-lg dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900">
                      {['镜号', '时间', '决策', '对白/音频'].map((h) => (
                        <th key={h} className="p-2 text-left font-medium text-gray-700 dark:text-gray-300">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {workbench.post_edit.timeline.map((item) => (
                      <tr key={`${item.episode}-${item.shot_id}`} className="border-t border-gray-100 dark:border-gray-800">
                        <td className="p-2 font-mono text-gray-500 dark:text-gray-400">{item.shot_id}</td>
                        <td className="p-2 text-gray-400 dark:text-gray-500">
                          {item.start_sec}s - {item.end_sec}s
                        </td>
                        <td className="p-2">
                          <StatusBadge status={item.decision} />
                        </td>
                        <td className="p-2 max-w-[220px] truncate text-gray-700 dark:text-gray-300">
                          {item.dialogue || item.sfx || item.bgm_mood || '-'}
                        </td>
                      </tr>
                    ))}
                    {workbench.post_edit.timeline.length === 0 && (
                      <tr>
                        <td className="p-4 text-center text-gray-400 dark:text-gray-500" colSpan={4}>
                          暂无已审核选片。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Side Stack */}
          <div className="space-y-6">
            {/* Delivery Panel */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">成片交付包</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                生成 ZIP、剪辑表、字幕、音频补修、配乐 Cue、后期计划和平台外精剪调色清单。
              </p>
              {renderStageActions('delivery')}
              {renderStageFiles('delivery')}
              <div className="space-y-2 mb-5">
                {workbench.delivery.files.map((file) => (
                  <div key={file} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check size={13} className="text-green-600 dark:text-green-400" />
                    <span>{file}</span>
                  </div>
                ))}
              </div>
              <label className="flex items-center gap-2 mb-4 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={render}
                  onChange={(e) => setRender(e.target.checked)}
                  className="rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                />
                同时合成 final_cut.mp4 预览
              </label>
              <button
                onClick={handleExport}
                disabled={exporting || !status.ready_for_export}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Download size={14} />
                {exporting ? '生成中...' : render ? '生成交付包 + final_cut.mp4' : '生成交付包'}
              </button>
              {!status.ready_for_export && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-3">需要先完成质量审核并确保视频文件存在。</p>
              )}
            </div>

            {/* External Finishing Panel */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">平台外精剪调色</h3>
              <div className="space-y-2 mt-4">
                {workbench.delivery.external_finishing.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Result Panel */}
            {result && (
              <div className="p-6 bg-white rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Check size={16} className="text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{result.message}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{result.export_dir}</p>
                  </div>
                </div>
                {result.render_error && <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-3 dark:bg-red-900/20 dark:text-red-400">{result.render_error}</div>}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  时间线：{result.manifest.timeline_duration_sec}s · {result.manifest.timeline.length} 镜
                </p>
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Download size={14} /> 下载 ZIP
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
