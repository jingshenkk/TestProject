import { useEffect, useRef, useState, type ComponentType } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Archive,
  Check,
  Clock,
  Download,
  FileText,
  Film,
  Sparkles,
  Upload,
  Zap,
  type LucideProps,
} from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import ProcessStepBar from '@/components/ProcessStepBar';
import {
  DEFAULT_SUNO_MODEL_OPTIONS,
  formatSunoModelLabel,
  mockAudioStatus,
  mockMusicSegments,
  mockWorkbench,
  type AudioFile,
  type AudioStatus,
  type ExportResult,
  type StageStatus,
  type Workbench,
} from '@/mocks/postProduction';

/* ── 通用：轻量 Toast（与其它页一致，不依赖 console） ──────────────────────── */
type ToastTone = 'success' | 'error' | 'info';
interface ToastState {
  tone: ToastTone;
  message: string;
  visible: boolean;
}
const TOAST_TONE: Record<ToastTone, { dot: string; icon: string }> = {
  success: { dot: 'bg-[var(--color-success)]', icon: 'text-[var(--color-success)]' },
  error: { dot: 'bg-[var(--color-error)]', icon: 'text-[var(--color-error)]' },
  info: { dot: 'bg-[var(--accent-primary)]', icon: 'text-[var(--accent-primary)]' },
};

/* ── 状态徽章（token 化，与全局设计系统同源） ──────────────────────────────── */
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
const STATUS_TONE: Record<string, string> = {
  completed: 'bg-[var(--color-success)]/12 text-[var(--color-success)]',
  pass: 'bg-[var(--color-success)]/12 text-[var(--color-success)]',
  done: 'bg-[var(--color-success)]/12 text-[var(--color-success)]',
  selected: 'bg-[var(--color-success)]/12 text-[var(--color-success)]',
  passable: 'bg-[var(--color-warning)]/14 text-[var(--color-warning)]',
  generating: 'bg-[var(--accent-primary-bg)] text-[var(--accent-primary)]',
  running: 'bg-[var(--accent-primary-bg)] text-[var(--accent-primary)]',
  in_progress: 'bg-[var(--accent-primary-bg)] text-[var(--accent-primary)]',
  queued: 'bg-[var(--color-warning)]/14 text-[var(--color-warning)]',
  pending: 'bg-[var(--color-warning)]/14 text-[var(--color-warning)]',
  failed: 'bg-[var(--color-error)]/12 text-[var(--color-error)]',
  reject: 'bg-[var(--color-error)]/12 text-[var(--color-error)]',
  blocked: 'bg-[var(--color-error)]/12 text-[var(--color-error)]',
  cancelled: 'bg-[var(--bg-surface)] text-[var(--text-muted)]',
};
function StatusBadge({ status, label }: { status: string; label?: string }) {
  const displayLabel = label || STATUS_LABELS[status] || status;
  const tone = STATUS_TONE[status] || 'bg-[var(--bg-surface)] text-[var(--text-muted)]';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${tone}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {displayLabel}
    </span>
  );
}

/* ── 阶段语调 → token 类 ───────────────────────────────────────────────────── */
const stageIcons: Record<string, ComponentType<LucideProps>> = {
  audio_repair: Zap,
  music: Clock,
  post_edit: Film,
  delivery: Archive,
};
function stageTone(status: StageStatus) {
  switch (status) {
    case 'completed':
      return { label: '完成', accent: 'var(--color-success)' };
    case 'in_progress':
      return { label: '进行中', accent: 'var(--accent-primary)' };
    case 'ready':
      return { label: '就绪', accent: 'var(--color-success)' };
    case 'blocked':
      return { label: '阻塞', accent: 'var(--color-warning)' };
    default:
      return { label: '待准备', accent: 'var(--text-muted)' };
  }
}

function shortList(items: string[], limit = 6) {
  if (!items.length) return '无';
  const head = items.slice(0, limit).join('、');
  return items.length > limit ? `${head} 等 ${items.length} 项` : head;
}

const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

export default function PostProductionPage() {
  const [workbench, setWorkbench] = useState<Workbench>(() => structuredClone(mockWorkbench));
  const [audioStatus, setAudioStatus] = useState<AudioStatus>(mockAudioStatus);
  const [musicSegments, setMusicSegments] = useState(mockMusicSegments);
  const [result, setResult] = useState<ExportResult | null>(null);

  const [exporting, setExporting] = useState(false);
  const [busyStage, setBusyStage] = useState('');
  const [uploadingStage, setUploadingStage] = useState('');
  const [render, setRender] = useState(false);

  const [genProvider, setGenProvider] = useState('cosyvoice');
  const [musicStyle, setMusicStyle] = useState('');
  const [musicInstruments, setMusicInstruments] = useState('');
  const [musicModel, setMusicModel] = useState('');
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);
  const [mixLevels, setMixLevels] = useState({ dialogue: -6, sfx: -12, music: -18 });

  const [dialogueProgress, setDialogueProgress] = useState('');
  const [sfxProgress, setSfxProgress] = useState('');
  const [musicProgress, setMusicProgress] = useState('');
  const [normalizing, setNormalizing] = useState(false);

  const [toast, setToast] = useState<ToastState>({ tone: 'info', message: '', visible: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = (message: string, tone: ToastTone = 'success') => {
    setToast({ tone, message, visible: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 2600);
  };
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const audioFileUrl = (path: string) => `/api/post/file?path=${encodeURIComponent(path)}`;

  /* ── 乐观的 mock 生成 handler（后端接入前可离线体验完整流程）────────────────── */
  const handleGenDialogue = async () => {
    if (!workbench.audio_repair.dialogue_count) return;
    setDialogueProgress('生成中...');
    await delay(700);
    setWorkbench((prev) => ({
      ...prev,
      audio_repair: {
        ...prev.audio_repair,
        dialogue_cues: prev.audio_repair.dialogue_cues.map((cue) =>
          cue.is_spoken === false
            ? cue
            : { ...cue, generated: true, generated_file: { name: `${cue.shot_id}_dialogue.wav`, path: `post/audio/dialogue/${cue.shot_id}.wav`, size_bytes: 88200, ext: 'wav' } }
        ),
      },
    }));
    setAudioStatus((prev) => ({
      ...prev,
      dialogue: { completed: prev.dialogue!.total, total: prev.dialogue!.total, issues: prev.dialogue!.issues },
    }));
    notify('对白生成完成');
    setDialogueProgress('');
  };

  const handleGenSingleDialogue = async (shotId: string) => {
    await delay(450);
    setWorkbench((prev) => ({
      ...prev,
      audio_repair: {
        ...prev.audio_repair,
        dialogue_cues: prev.audio_repair.dialogue_cues.map((cue) =>
          cue.shot_id === shotId
            ? { ...cue, generated: true, generated_file: { name: `${shotId}_dialogue.wav`, path: `post/audio/dialogue/${shotId}.wav`, size_bytes: 88200, ext: 'wav' } }
            : cue
        ),
      },
    }));
    notify('对白生成完成');
  };

  const handleGenSFX = async () => {
    if (!workbench.audio_repair.sfx_count) return;
    setSfxProgress('生成中...');
    await delay(700);
    setWorkbench((prev) => ({
      ...prev,
      audio_repair: {
        ...prev.audio_repair,
        sfx_cues: prev.audio_repair.sfx_cues.map((cue) => ({
          ...cue,
          generated: true,
          generated_file: { name: `${cue.shot_id}_sfx.wav`, path: `post/audio/sfx/${cue.shot_id}.wav`, size_bytes: 66150, ext: 'wav' },
        })),
      },
    }));
    setAudioStatus((prev) => ({ ...prev, sfx: { completed: prev.sfx!.total, total: prev.sfx!.total } }));
    notify('音效生成完成');
    setSfxProgress('');
  };

  const handleGenSingleSFX = async (shotId: string) => {
    await delay(450);
    setWorkbench((prev) => ({
      ...prev,
      audio_repair: {
        ...prev.audio_repair,
        sfx_cues: prev.audio_repair.sfx_cues.map((cue) =>
          cue.shot_id === shotId
            ? { ...cue, generated: true, generated_file: { name: `${shotId}_sfx.wav`, path: `post/audio/sfx/${shotId}.wav`, size_bytes: 66150, ext: 'wav' } }
            : cue
        ),
      },
    }));
    notify('音效生成完成');
  };

  const handleGenMusic = async () => {
    if (!musicSegments.length) return;
    setMusicProgress('生成中（配乐需 20-60 秒/段）...');
    await delay(900);
    setMusicSegments((prev) =>
      prev.map((seg) => ({ ...seg, generated_file: { name: `${seg.shot_id}_bgm.wav`, path: `post/audio/music/${seg.shot_id}.wav`, size_bytes: 264600, ext: 'wav' } }))
    );
    setAudioStatus((prev) => ({ ...prev, music: { completed: prev.music!.total, total: prev.music!.total } }));
    notify('配乐生成完成');
    setMusicProgress('');
  };

  const handleGenSingleMusic = async (segIdx: number) => {
    await delay(600);
    setMusicSegments((prev) =>
      prev.map((seg, i) =>
        i === segIdx
          ? { ...seg, generated_file: { name: `${seg.shot_id}_bgm.wav`, path: `post/audio/music/${seg.shot_id}.wav`, size_bytes: 264600, ext: 'wav' } }
          : seg
      )
    );
    notify('配乐段生成完成');
  };

  const handleMix = async () => {
    await delay(800);
    const out = 'post/audio/mixed_audio.wav';
    setPreviewAudio(out);
    setAudioStatus((prev) => ({ ...prev, mix: { can_mix: true, blockers: [], output_path: out } }));
    notify('混音完成');
  };

  const handleNormalize = async () => {
    setNormalizing(true);
    await delay(700);
    notify('响度均一化完成');
    setNormalizing(false);
  };

  const handleExport = async () => {
    setExporting(true);
    await delay(1000);
    const manifest = {
      timeline_duration_sec: workbench.post_edit.timeline.reduce((sum, item) => sum + item.duration_sec, 0),
      timeline: workbench.post_edit.timeline,
    };
    setResult({
      success: true,
      message: '成片交付包已生成',
      export_dir: `${workbench.status.post_dir}/delivery`,
      zip_path: `${workbench.status.post_dir}/delivery/final.zip`,
      final_video_path: render ? `${workbench.status.post_dir}/final_cut.mp4` : '',
      render_error: '',
      manifest,
    });
    notify('成片交付包已生成');
    setExporting(false);
  };

  const handlePrepareStage = async (stageKey: string) => {
    setBusyStage(stageKey);
    await delay(600);
    setWorkbench((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) =>
        stage.key === stageKey
          ? { ...stage, status: 'ready', workspace_status: '就绪', generated_files: stage.generated_files.includes(`${stageKey}.plan.json`) ? stage.generated_files : [...stage.generated_files, `${stageKey}.plan.json`] }
          : stage
      ),
    }));
    const stage = workbench.stages.find((s) => s.key === stageKey);
    notify(`${stage?.label || stageKey}工作文件已生成`);
    setBusyStage('');
  };

  const handleCompleteStage = async (stageKey: string) => {
    const stage = workbench.stages.find((s) => s.key === stageKey);
    if (!stage || stage.blockers.length > 0) return;
    setBusyStage(stageKey);
    await delay(500);
    setWorkbench((prev) => {
      const stages = prev.stages.map((s) => (s.key === stageKey ? { ...s, status: 'completed' as StageStatus, completed_at: '2026-07-24 10:30', workspace_status: '完成' } : s));
      // 完成精剪调色后解锁交付并允许导出
      const readyForExport = stageKey === 'post_edit' ? true : prev.status.ready_for_export;
      return { ...prev, stages, status: { ...prev.status, ready_for_export: readyForExport, ready_for_render: readyForExport } };
    });
    notify('阶段已标记完成');
    setBusyStage('');
  };

  const handleUploadStage = async (stageKey: string, file?: File) => {
    if (!file) return;
    setUploadingStage(stageKey);
    await delay(500);
    notify(`${file.name} 已作为产物上传`);
    setUploadingStage('');
  };

  /* ── 派生渲染状态 ───────────────────────────────────────────────────────── */
  const { status } = workbench;
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
  const audioFileCount = audioStatus.audio_file_count + Number(workbench.audio_repair.dialogue_cues.filter((c) => c.generated).length);
  const mixCanRun = !!audioStatus.mix?.can_mix || audioFileCount > 0;
  const mixBlockerText = (audioStatus.mix?.blockers || []).join('；');
  const mixPreviewPath = previewAudio || audioStatus.mix?.output_path || '';

  const renderAudioPlayer = (file?: AudioFile | null) => {
    if (!file?.path) return <span className="text-xs text-[var(--text-muted)]">未生成</span>;
    return (
      <div className="flex flex-col gap-1">
        <audio controls src={audioFileUrl(file.path)} className="w-full h-8" />
        <a href={fileUrl(file.path)} className="text-xs text-[var(--accent-primary)] hover:underline">
          {file.name}
        </a>
      </div>
    );
  };

  const renderStageActions = (stageKey: string) => {
    const stage = stageByKey[stageKey];
    if (!stage) return null;
    const blocked = stage.blockers.length > 0;
    const btnBase =
      'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-ring';
    return (
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => handlePrepareStage(stageKey)}
          disabled={busyStage === stageKey}
          className={`${btnBase} bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]`}
        >
          <FileText size={14} />
          {busyStage === stageKey ? '生成中...' : '生成本阶段文件'}
        </button>
        <label
          className={`${btnBase} cursor-pointer bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] ${uploadingStage === stageKey ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <Upload size={14} />
          {uploadingStage === stageKey ? '上传中...' : '上传产物'}
          <input type="file" className="hidden" onChange={(event) => handleUploadStage(stageKey, event.target.files?.[0])} />
        </label>
        <button
          type="button"
          onClick={() => handleCompleteStage(stageKey)}
          disabled={busyStage === stageKey || blocked}
          title={blocked ? '存在阻塞项，暂不能标记完成' : '标记完成'}
          className={`${btnBase} bg-[var(--accent-primary-bg)] text-[var(--accent-primary)] border border-[var(--border-accent)] hover:bg-[var(--accent-primary)] hover:text-white`}
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
            className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-[var(--accent-primary)] bg-[var(--accent-primary-bg)] rounded hover:opacity-80"
          >
            <Download size={13} />
            {path.split(/[\\/]/).pop()}
          </a>
        ))}
        {artifacts.map((artifact) => (
          <a
            key={artifact.id}
            href={fileUrl(artifact.path)}
            className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-[var(--accent-primary)] bg-[var(--accent-primary-bg)] rounded hover:opacity-80"
          >
            <Download size={13} />
            {artifact.name}
            <span className="px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] bg-[var(--bg-surface)] rounded">上传产物</span>
          </a>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* 顶层导航：与其余子模块统一使用 AppHeader */}
      <AppHeader title={workbench.status.project_name} subtitle="后期制作" />

      {/* 页面内容 */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        {/* 流程步骤栏 */}
        <ProcessStepBar />

        <div className="animate-fade-in">
          {/* 阶段看板 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mb-6">
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
                  className="glass-panel p-4 relative overflow-hidden"
                  style={{ boxShadow: `inset 0 0 0 1px ${tone.accent}22` }}
                >
                  <span
                    className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full"
                    style={{ background: tone.accent }}
                  />
                  <div className="flex items-start justify-between gap-3 mb-3 pl-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="p-2 rounded-lg" style={{ background: `${tone.accent}1f`, color: tone.accent }}>
                        <StageIcon size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs text-[var(--text-muted)]">{index + 1}</p>
                        <h3 className="font-semibold text-[var(--text-primary)] truncate">{stage.label}</h3>
                      </div>
                    </div>
                    <span
                      className="px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap"
                      style={{ background: `${tone.accent}1f`, color: tone.accent }}
                    >
                      {tone.label}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-2 pl-2">{stage.description}</p>
                  {stageDeps.length > 0 && (
                    <p className="text-xs text-[var(--text-muted)] mb-1 pl-2">
                      依赖：{stageDeps.map((d) => workbench.stages.find((s) => s.key === d)?.label || d).join(' · 已完成')}
                    </p>
                  )}
                  {blockedBy.length > 0 && (
                    <p className="text-xs text-[var(--color-error)] mb-1 pl-2">
                      阻塞：等待 {blockedBy.map((d) => workbench.stages.find((s) => s.key === d)?.label || d).join('、')} 完成
                    </p>
                  )}
                  <div className="mt-3 flex items-end justify-between text-sm pl-2">
                    <span className="text-[var(--text-muted)]">条目</span>
                    <span className="font-semibold text-[var(--text-primary)]">{stage.item_count}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] pl-2">文件 {stage.generated_files.length} · 产物 {stage.artifact_count}</p>
                </div>
              );
            })}
          </div>

          {/* 就绪状态卡 */}
          <div
            className="glass-panel p-4 mb-6"
            style={{ boxShadow: `inset 0 0 0 1px ${status.ready_for_export ? 'var(--color-success)' : 'var(--color-warning)'}33` }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                {status.ready_for_export ? (
                  <Check size={16} className="text-[var(--color-success)]" />
                ) : (
                  <AlertTriangle size={16} className="text-[var(--color-warning)]" />
                )}
                <span className="font-semibold text-[var(--text-primary)]">
                  {status.ready_for_export ? '后期链路已就绪，可以生成成片交付包' : '后期链路仍有未完成项'}
                </span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">交付目录：{status.post_dir}</p>
            </div>
            {!status.ready_for_export && (
              <p className="text-sm text-[var(--color-error)]">
                未完成：{shortList([...status.missing_review, ...status.missing_video_files])}
              </p>
            )}
            {status.completed_missing_video_files.length > 0 && (
              <p className="text-sm text-[var(--text-muted)] mt-2">
                已忽略 {status.completed_missing_video_files.length} 条历史缺文件视频记录，不参与后期导出。
              </p>
            )}
          </div>

          {/* 生成能力网格 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mb-6">
            {([
              ['cosyvoice', '中文对白'],
              ['elevenlabs', '音效/多语言'],
              ['suno', 'AI 配乐'],
              ['ffmpeg', '混音/合成'],
            ] as const).map(([key, label]) => {
              const item = capabilities[key];
              const ok = !!item?.configured;
              return (
                <div
                  key={key}
                  className="glass-panel p-4"
                  style={{ boxShadow: `inset 0 0 0 1px ${ok ? 'var(--color-success)' : 'var(--color-warning)'}33` }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-medium text-[var(--text-primary)]">{label}</span>
                    <span
                      className="px-2 py-1 text-xs font-medium rounded-full"
                      style={{ background: ok ? 'var(--color-success)1f' : 'var(--color-warning)1f', color: ok ? 'var(--color-success)' : 'var(--color-warning)' }}
                    >
                      {ok ? '可用' : '未配置'}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{item?.label || key} · {ok ? '可执行生成/处理' : item?.action || '需配置后使用'}</p>
                </div>
              );
            })}
          </div>

          {/* 工作台主区 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* 主栈 */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">
              {/* 音频补修 */}
              <div className="glass-panel p-4 lg:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">音频补修</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      对白、声线、环境音和动作音效的 AI 生成与补修。
                      {audioStatus.dialogue && <span> · 已生成 {audioStatus.dialogue.completed}/{audioStatus.dialogue.total} 可合成对白</span>}
                      {audioStatus.dialogue && audioStatus.dialogue.issues > 0 && <span> · 待核对白 {audioStatus.dialogue.issues}</span>}
                      {audioStatus.sfx && <span> · 已生成 {audioStatus.sfx.completed}/{audioStatus.sfx.total} 音效</span>}
                    </p>
                  </div>
                  <span className="text-sm text-[var(--text-muted)]">
                    可合成 {workbench.audio_repair.dialogue_count} · 待核 {workbench.audio_repair.dialogue_issue_count || 0} · 音效 {workbench.audio_repair.sfx_count}
                  </span>
                </div>

                {/* AI 生成工具栏 */}
                <div className="flex flex-wrap items-center gap-3 p-3 bg-[var(--bg-canvas)] rounded-lg mb-4 border border-[var(--border-subtle)]">
                  <span className="text-sm font-medium text-[var(--text-secondary)]">AI 生成</span>
                  <select
                    value={genProvider}
                    onChange={(e) => setGenProvider(e.target.value)}
                    className="px-3 py-1.5 text-sm rounded-lg bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus-ring outline-none"
                  >
                    <option value="cosyvoice">CosyVoice (中文)</option>
                    <option value="elevenlabs">ElevenLabs (多语言)</option>
                  </select>
                  <button
                    onClick={handleGenDialogue}
                    disabled={!!dialogueProgress || workbench.audio_repair.dialogue_count === 0 || !dialogueProviderReady}
                    title={!dialogueProviderReady ? dialogueProvider?.action || '当前对白生成服务未配置' : ''}
                    className="focus-ring inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:text-[var(--text-primary)] hover:border-[var(--border-default)] disabled:opacity-50"
                  >
                    <Zap size={12} />
                    {dialogueProgress || `生成全部对白 (${workbench.audio_repair.dialogue_count})`}
                  </button>
                  <button
                    onClick={handleGenSFX}
                    disabled={!!sfxProgress || workbench.audio_repair.sfx_count === 0 || !sfxReady}
                    title={!sfxReady ? (capabilities.elevenlabs?.sfx_supported === false ? '当前 ElevenLabs 配置为多语言 TTS，不支持音效生成' : capabilities.elevenlabs?.action || '当前音效生成服务未配置') : ''}
                    className="focus-ring inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:text-[var(--text-primary)] hover:border-[var(--border-default)] disabled:opacity-50"
                  >
                    <Zap size={12} />
                    {sfxProgress || `生成全部音效 (${workbench.audio_repair.sfx_count})`}
                  </button>
                  <button
                    onClick={handleNormalize}
                    disabled={normalizing || !ffmpegReady || audioFileCount === 0}
                    title={!ffmpegReady ? '未检测到 FFmpeg' : audioFileCount === 0 ? '还没有可处理的音频文件' : ''}
                    className="focus-ring inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:text-[var(--text-primary)] hover:border-[var(--border-default)] disabled:opacity-50"
                  >
                    {normalizing ? '处理中...' : '响度均一化'}
                  </button>
                </div>

                {!dialogueProviderReady && (
                  <p className="text-sm text-[var(--color-error)] mb-3">
                    当前 {dialogueProvider?.label || genProvider} 未配置，已禁用对白生成按钮：{dialogueProvider?.action || '请先配置对应服务'}。
                  </p>
                )}
                {capabilities.elevenlabs?.configured && capabilities.elevenlabs?.sfx_supported === false && (
                  <p className="text-sm text-[var(--color-error)] mb-3">
                    当前 ElevenLabs 已接入 {capabilities.elevenlabs.provider || 'shengsuan'} / {capabilities.elevenlabs.model || 'TTS'}，可用于多语言对白；音效生成仍需官方 SFX 或独立音效模型。
                  </p>
                )}
                {(workbench.audio_repair.dialogue_issue_count || 0) > 0 && (
                  <p className="text-sm text-[var(--color-error)] mb-3">
                    有 {workbench.audio_repair.dialogue_issue_count} 条对白只有表演/声音提示或空角色前缀，已移出 TTS 队列，需要先人工补成真实台词或上传人工修补产物。
                  </p>
                )}

                {renderStageActions('audio_repair')}
                {renderStageFiles('audio_repair')}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 对白表 */}
                  <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[var(--bg-canvas)]">
                          {['镜号', '对白', '声线', '音频', '操作'].map((h) => (
                            <th key={h} className="p-2 text-left font-medium text-[var(--text-secondary)]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {workbench.audio_repair.dialogue_cues.slice(0, 12).map((cue) => (
                          <tr key={cue.shot_id} className="border-t border-[var(--border-subtle)]">
                            <td className="p-2 font-mono text-[var(--text-muted)]">{cue.shot_id}</td>
                            <td className="p-2 max-w-[240px]" title={cue.raw_dialogue || cue.dialogue}>
                              <div className="truncate text-[var(--text-primary)]">{cue.spoken_text || cue.dialogue}</div>
                              {cue.performance_note && <div className="text-[var(--text-muted)] truncate">表演：{cue.performance_note}</div>}
                            </td>
                            <td className={`p-2 ${cue.voice_tone ? 'text-[var(--text-secondary)]' : 'text-[var(--color-error)]'}`}>{cue.voice_tone || '未绑定'}</td>
                            <td className="p-2">{renderAudioPlayer(cue.generated_file)}</td>
                            <td className="p-2">
                              <button
                                onClick={() => handleGenSingleDialogue(cue.shot_id)}
                                disabled={!dialogueProviderReady}
                                className="text-xs text-[var(--accent-primary)] hover:underline disabled:opacity-50"
                              >
                                {cue.generated ? '重生成' : '生成'}
                              </button>
                            </td>
                          </tr>
                        ))}
                        {workbench.audio_repair.dialogue_cues.length === 0 && (
                          <tr><td className="p-3 text-center text-[var(--text-muted)]" colSpan={5}>暂无对白 Cue</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* 声线 & 音效 */}
                  <div className="space-y-3">
                    {workbench.audio_repair.voice_profiles.slice(0, 5).map((profile) => (
                      <div key={profile.char_id} className="p-3 bg-[var(--bg-canvas)] rounded-lg border border-[var(--border-subtle)]">
                        <p className="font-medium text-sm text-[var(--text-primary)]">{profile.char_id} · {profile.name}</p>
                        <p className="text-sm text-[var(--text-muted)]">{profile.voice_tone}</p>
                      </div>
                    ))}
                    {workbench.audio_repair.voice_profiles.length === 0 && <p className="text-sm text-[var(--text-muted)]">暂无角色声线记录。</p>}
                    {!!workbench.audio_repair.dialogue_issues?.length && (
                      <div className="p-3 bg-[var(--color-warning)]/8 rounded-lg border border-[var(--color-warning)]/30">
                        <p className="font-medium text-sm text-[var(--color-warning)] mb-2">待人工修订对白</p>
                        {workbench.audio_repair.dialogue_issues.slice(0, 6).map((cue) => (
                          <div key={cue.shot_id} className="mb-2">
                            <div className="flex items-start justify-between gap-2 text-xs">
                              <span className="font-mono text-[var(--color-warning)]">{cue.shot_id}</span>
                              <span className="text-[var(--text-secondary)]">{cue.message}</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] truncate mt-1" title={cue.raw_dialogue}>原字段：{cue.raw_dialogue}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {workbench.audio_repair.sfx_cues.length > 0 && (
                      <div className="p-3 bg-[var(--bg-canvas)] rounded-lg border border-[var(--border-subtle)]">
                        <p className="font-medium text-sm text-[var(--text-primary)] mb-2">音效队列</p>
                        {workbench.audio_repair.sfx_cues.slice(0, 6).map((cue) => (
                          <div key={cue.shot_id} className="mb-3">
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span className="font-mono text-[var(--text-muted)]">{cue.shot_id}</span>
                              <span className="text-[var(--text-secondary)] flex-1">
                                {cue.sfx}
                                {cue.source === 'inferred' && <span className="text-[var(--text-muted)]"> · 推导/{cue.confidence || 'medium'}</span>}
                              </span>
                              <button onClick={() => handleGenSingleSFX(cue.shot_id)} disabled={!sfxReady} className="text-[var(--accent-primary)] hover:underline disabled:opacity-50">
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

              {/* 配乐制作 */}
              <div className="glass-panel p-4 lg:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">配乐制作</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      AI 生成跨镜连续配乐，按情绪曲线分段。
                      {audioStatus.music && <span> · 已生成 {audioStatus.music.completed}/{audioStatus.music.total} 段</span>}
                    </p>
                  </div>
                  <span className="text-sm text-[var(--text-muted)]">{workbench.music.cues.length} 条 Cue · {musicSegments.length} 情绪段</span>
                </div>

                {/* AI 配乐工具栏 */}
                <div className="flex flex-wrap items-center gap-3 p-3 bg-[var(--bg-canvas)] rounded-lg mb-4 border border-[var(--border-subtle)]">
                  <span className="text-sm font-medium text-[var(--text-secondary)]">配乐</span>
                  <input
                    type="text"
                    placeholder="风格 (如 电影感写实)"
                    value={musicStyle}
                    onChange={(e) => setMusicStyle(e.target.value)}
                    className="px-3 py-1.5 text-sm rounded-lg flex-1 min-w-[100px] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border-subtle)] focus-ring outline-none"
                  />
                  <input
                    type="text"
                    placeholder="乐器 (如 管弦乐)"
                    value={musicInstruments}
                    onChange={(e) => setMusicInstruments(e.target.value)}
                    className="px-3 py-1.5 text-sm rounded-lg flex-1 min-w-[100px] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border-subtle)] focus-ring outline-none"
                  />
                  <select
                    value={musicModel}
                    onChange={(e) => setMusicModel(e.target.value)}
                    disabled={!!musicProgress}
                    title="选择提交给 Suno 或代理服务的配乐模型"
                    className="px-3 py-1.5 text-sm rounded-lg bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus-ring outline-none disabled:opacity-50"
                  >
                    <option value="">模型：默认{defaultMusicModel ? `（${formatSunoModelLabel(defaultMusicModel)}）` : ''}</option>
                    {musicModelChoices.map((model) => (
                      <option key={model} value={model}>{formatSunoModelLabel(model)}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleGenMusic}
                    disabled={!!musicProgress || musicSegments.length === 0 || !musicReady}
                    title={!musicReady ? capabilities.suno?.action || '当前配乐生成服务未配置' : ''}
                    className="focus-ring inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:text-[var(--text-primary)] hover:border-[var(--border-default)] disabled:opacity-50"
                  >
                    <Zap size={12} />
                    {musicProgress || `生成全部配乐 (${musicSegments.length} 段)`}
                  </button>
                </div>
                {!musicReady && (
                  <p className="text-sm text-[var(--color-error)] mb-3">Suno 未配置，已禁用 AI 配乐生成：{capabilities.suno?.action || '请先配置 SUNO_API_KEY + SUNO_BASE_URL'}。</p>
                )}

                {renderStageActions('music')}
                {renderStageFiles('music')}

                {musicSegments.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {musicSegments.map((seg, i) => (
                      <div key={i} className="p-3 bg-[var(--bg-canvas)] rounded-lg border border-[var(--border-subtle)]">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-sm text-[var(--text-secondary)]">{seg.start_sec}s - {seg.end_sec}s</span>
                          <span className="text-sm text-[var(--text-muted)]">{seg.duration_sec}s</span>
                          <button onClick={() => handleGenSingleMusic(i)} disabled={!musicReady} className="text-xs text-[var(--accent-primary)] hover:underline disabled:opacity-50">
                            {seg.generated_file ? '重生成' : '生成'}
                          </button>
                        </div>
                        <p className="font-medium text-[var(--text-primary)]">{seg.mood}</p>
                        {seg.narrative_beat && <p className="text-sm text-[var(--text-secondary)]">{seg.narrative_beat}</p>}
                        <p className="text-sm text-[var(--text-muted)] mt-1">{seg.prompt}</p>
                        <div className="mt-2">{renderAudioPlayer(seg.generated_file)}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {workbench.music.mood_counts.map((item) => (
                    <span key={item.mood} className="px-2 py-1 text-xs bg-[var(--bg-surface)] text-[var(--text-secondary)] rounded-full border border-[var(--border-subtle)]">
                      {item.mood} · {item.count}
                    </span>
                  ))}
                </div>
              </div>

              {/* 混音 */}
              <div className="glass-panel p-4 lg:p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">混音</h3>
                  <p className="text-sm text-[var(--text-muted)]">对白/音效/配乐三轨混音 + 响度标准化 (-16 LUFS)</p>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {([
                    { label: '对白轨', key: 'dialogue', db: mixLevels.dialogue },
                    { label: '音效轨', key: 'sfx', db: mixLevels.sfx },
                    { label: '配乐轨', key: 'music', db: mixLevels.music },
                  ] as const).map((track) => (
                    <div key={track.key} className="p-3 bg-[var(--bg-canvas)] rounded-lg border border-[var(--border-subtle)]">
                      <p
                        className={`text-sm font-medium ${
                          track.key === 'dialogue' ? 'text-[var(--accent-primary)]' : track.key === 'sfx' ? 'text-[var(--color-success)]' : 'text-[var(--accent-tertiary)]'
                        }`}
                      >
                        {track.label}
                      </p>
                      <input
                        type="range"
                        min="-24"
                        max="0"
                        value={track.db}
                        onChange={(e) => setMixLevels((prev) => ({ ...prev, [track.key]: Number(e.target.value) }))}
                        className="w-full mt-1"
                        style={{ accentColor: 'var(--accent-primary)' }}
                      />
                      <p className="text-xs text-[var(--text-muted)] mt-1">{track.db} dB</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleMix}
                  disabled={!ffmpegReady || !mixCanRun}
                  title={!ffmpegReady ? '未检测到 FFmpeg，无法混音' : !mixCanRun ? mixBlockerText || '还没有可混音的音频文件' : ''}
                  className="focus-ring relative overflow-hidden inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[var(--accent-primary)] rounded-lg hover:bg-[var(--accent-primary-dim)] disabled:opacity-50"
                >
                  <Zap size={14} /> 自动混音
                  <span className="cta-shimmer-bar" aria-hidden="true" />
                </button>
                {!mixCanRun && (
                  <p className="text-sm text-[var(--color-error)] mt-3">混音暂不可用：{mixBlockerText || '还没有可混音的对白、音效或配乐文件'}。</p>
                )}
                {mixPreviewPath && (
                  <div className="p-3 mt-4 bg-[var(--bg-canvas)] rounded-lg border border-[var(--border-subtle)]">
                    <p className="text-sm text-[var(--text-secondary)] mb-2">当前混音轨 · 会在导出 final_cut.mp4 时自动合入</p>
                    <audio controls src={audioFileUrl(mixPreviewPath)} className="w-full mb-2" />
                    <a href={fileUrl(mixPreviewPath)} className="text-sm text-[var(--accent-primary)] hover:underline">下载 mixed_audio.wav</a>
                  </div>
                )}
              </div>

              {/* 时间线 */}
              <div className="glass-panel p-4 lg:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">后期制作时间线</h3>
                    <p className="text-sm text-[var(--text-muted)]">审核通过镜头会进入最终剪辑决策表和字幕草稿。</p>
                  </div>
                  <span className="text-sm text-[var(--text-muted)]">{workbench.post_edit.selected_clips}/{status.total_shots} 镜</span>
                </div>
                {renderStageActions('post_edit')}
                {renderStageFiles('post_edit')}
                <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[var(--bg-canvas)]">
                        {['镜号', '时间', '决策', '对白/音频'].map((h) => (
                          <th key={h} className="p-2 text-left font-medium text-[var(--text-secondary)]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {workbench.post_edit.timeline.map((item) => (
                        <tr key={`${item.episode}-${item.shot_id}`} className="border-t border-[var(--border-subtle)]">
                          <td className="p-2 font-mono text-[var(--text-muted)]">{item.shot_id}</td>
                          <td className="p-2 text-[var(--text-muted)]">{item.start_sec}s - {item.end_sec}s</td>
                          <td className="p-2"><StatusBadge status={item.decision} /></td>
                          <td className="p-2 max-w-[220px] truncate text-[var(--text-secondary)]">{item.dialogue || item.sfx || item.bgm_mood || '-'}</td>
                        </tr>
                      ))}
                      {workbench.post_edit.timeline.length === 0 && (
                        <tr><td className="p-4 text-center text-[var(--text-muted)]" colSpan={4}>暂无已审核选片。</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 侧栈 */}
            <div className="space-y-4 lg:space-y-6">
              {/* 交付包 */}
              <div className="glass-panel p-4 lg:p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">成片交付包</h3>
                <p className="text-sm text-[var(--text-muted)] mb-4">生成 ZIP、剪辑表、字幕、音频补修、配乐 Cue、后期计划和平台外精剪调色清单。</p>
                {renderStageActions('delivery')}
                {renderStageFiles('delivery')}
                <div className="space-y-2 mb-5">
                  {workbench.delivery.files.map((file) => (
                    <div key={file} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Check size={13} className="text-[var(--color-success)]" />
                      <span>{file}</span>
                    </div>
                  ))}
                </div>
                <label className="flex items-center gap-2 mb-4 text-sm text-[var(--text-secondary)] cursor-pointer">
                  <input type="checkbox" checked={render} onChange={(e) => setRender(e.target.checked)} className="rounded border-[var(--border-default)] bg-[var(--bg-input)]" style={{ accentColor: 'var(--accent-primary)' }} />
                  同时合成 final_cut.mp4 预览
                </label>
                <button
                  onClick={handleExport}
                  disabled={exporting || !status.ready_for_export}
                  className="focus-ring relative overflow-hidden w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[var(--accent-primary)] rounded-lg hover:bg-[var(--accent-primary-dim)] disabled:opacity-50"
                >
                  <Download size={14} />
                  {exporting ? '生成中...' : render ? '生成交付包 + final_cut.mp4' : '生成交付包'}
                  {status.ready_for_export && <span className="cta-shimmer-bar" aria-hidden="true" />}
                </button>
                {!status.ready_for_export && (
                  <p className="text-sm text-[var(--color-error)] mt-3">需要先完成精剪调色阶段，并确保视频文件存在。</p>
                )}
              </div>

              {/* 平台外精剪调色 */}
              <div className="glass-panel p-4 lg:p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">平台外精剪调色</h3>
                <div className="space-y-2 mt-4">
                  {workbench.delivery.external_finishing.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => notify('精剪调色工程已加入离线队列', 'info')}
                  className="mt-4 focus-ring inline-flex items-center gap-1 text-sm text-[var(--accent-primary)] hover:underline"
                >
                  前往资产库中心 <ArrowRight size={14} />
                </button>
              </div>

              {/* 交付结果 */}
              {result && (
                <div className="glass-panel p-4 lg:p-6" style={{ boxShadow: 'inset 0 0 0 1px var(--color-success)33' }}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Check size={16} className="text-[var(--color-success)]" />
                        <span className="font-semibold text-[var(--text-primary)]">{result.message}</span>
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">{result.export_dir}</p>
                    </div>
                  </div>
                  {result.render_error && <div className="p-3 bg-[var(--color-error)]/12 text-[var(--color-error)] rounded-lg mb-3">{result.render_error}</div>}
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    时间线：{result.manifest.timeline_duration_sec}s · {result.manifest.timeline.length} 镜
                  </p>
                  <a
                    href={result.zip_path ? `/api/post/download?path=${encodeURIComponent(result.zip_path)}` : '#'}
                    className="focus-ring relative overflow-hidden w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[var(--accent-primary)] rounded-lg hover:bg-[var(--accent-primary-dim)]"
                  >
                    <Download size={14} /> 下载 ZIP
                    <span className="cta-shimmer-bar" aria-hidden="true" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
        role="status"
      >
        <div className="glass-panel px-4 py-3 flex items-center gap-2.5 min-w-[220px] shadow-elevated">
          <span className={`w-2 h-2 rounded-full ${TOAST_TONE[toast.tone].dot}`} />
          <span className="text-sm text-[var(--text-primary)]">{toast.message}</span>
          <Sparkles size={14} className={TOAST_TONE[toast.tone].icon} />
        </div>
      </div>
    </div>
  );
}