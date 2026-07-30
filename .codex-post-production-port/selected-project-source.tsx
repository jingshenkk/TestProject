import { useEffect, useState, type ComponentType } from 'react'
import { Link, useParams } from 'react-router-dom'
import apiClient from '../api/postApiClient'
import { useToast } from '../components/common/Toast'
import StatusBadge from '../components/common/StatusBadge'
import { getSelectedProject } from '../stores/selectedProject'
import {
  IconAlert,
  IconArrowLeft,
  IconArrowRight,
  IconArchive,
  IconCheck,
  IconClock,
  IconDownload,
  IconFile,
  IconReview,
  IconUpload,
  IconVideo,
  IconZap,
} from '../components/common/Icons'

interface PostStatus {
  project_id: number
  project_name: string
  total_shots: number
  selected_clips: number
  missing_review: string[]
  missing_video_files: string[]
  completed_missing_video_files: Array<{ video_asset_id: number; shot_id: string | null; file_path: string }>
  ready_for_export: boolean
  ready_for_render: boolean
  ffmpeg_available: boolean
  post_dir: string
}

interface StageItem {
  key: string
  label: string
  description: string
  status: 'ready' | 'blocked' | 'pending' | 'in_progress' | 'completed'
  item_count: number
  artifact_count: number
  generated_files: string[]
  workspace_status: string
  prepared_at: string
  completed_at: string
  notes: string
  blockers: unknown[]
  next_actions: string[]
}

interface CueBase {
  episode: number
  shot_id: string
  start_sec: number
  end_sec: number
  duration_sec: number
}

interface AudioFile {
  name: string
  path: string
  size_bytes: number
  ext: string
}

interface AudioProviderStatus {
  label: string
  configured: boolean
  action: string
  provider?: string
  model?: string
  model_options?: string[]
  sfx_model?: string
  sfx_supported?: boolean
  path?: string
}

interface Workbench {
  status: PostStatus
  stages: StageItem[]
  workspace: {
    artifacts: Array<{
      id: string
      stage: string
      stage_label: string
      type: string
      name: string
      path: string
      size_bytes: number
      notes: string
      created_at: string
    }>
    stages: Record<string, { status: string; generated_files?: string[]; notes?: string }>
    updated_at: string
  }
  audio_capabilities: Record<string, AudioProviderStatus>
  audio_repair: {
    dialogue_count: number
    dialogue_issue_count?: number
    sfx_count: number
    manual_artifact_count?: number
    can_complete?: boolean
    voice_profiles: Array<{ char_id: string; name: string; role: string; voice_tone: string }>
    dialogue_cues: Array<CueBase & {
      dialogue: string
      spoken_text?: string
      raw_dialogue?: string
      performance_note?: string
      speaker: string
      voice_tone: string
      needs_repair: boolean
      issue?: string
      is_spoken?: boolean
      generated?: boolean
      generated_file?: AudioFile | null
    }>
    dialogue_issues?: Array<CueBase & {
      raw_dialogue: string
      dialogue: string
      spoken_text: string
      performance_note: string
      speaker: string
      issue: string
      message: string
      is_spoken: boolean
    }>
    sfx_cues: Array<CueBase & {
      sfx: string
      source?: 'explicit' | 'inferred' | 'none'
      confidence?: 'high' | 'medium' | ''
      inferred_from?: string[]
      generated?: boolean
      generated_file?: AudioFile | null
    }>
  }
  music: {
    mood_counts: Array<{ mood: string; count: number }>
    cues: Array<CueBase & { mood: string; narrative_beat: string }>
  }
  post_edit: {
    timeline: Array<CueBase & { decision: string; video_asset_id: number; source_path: string; dialogue: string; sfx: string; bgm_mood: string }>
    selected_clips: number
    missing_items: string[]
    stale_missing_video_files: Array<{ video_asset_id: number; shot_id: string | null; file_path: string }>
    ready_for_render: boolean
  }
  delivery: {
    files: string[]
    ready_for_export: boolean
    ffmpeg_available: boolean
    external_finishing: string[]
  }
}

interface ExportResult {
  success: boolean
  message: string
  export_dir: string
  zip_path: string
  final_video_path: string
  render_error: string
  mixed_audio_path?: string
  workbench?: Workbench
  manifest: {
    timeline_duration_sec: number
    timeline: Array<{ episode: number; shot_id: string; start_sec: number; end_sec: number; duration_sec: number; decision: string; video_asset_id: number; source_path: string; dialogue: string; sfx: string; bgm_mood: string }>
  }
}

const stageIcons: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  audio_repair: IconZap,
  music: IconClock,
  post_edit: IconVideo,
  delivery: IconArchive,
}

function stageTone(status: StageItem['status']) {
  if (status === 'completed') return { label: '完成', className: 'is-ready' }
  if (status === 'in_progress') return { label: '进行中', className: 'is-running' }
  if (status === 'ready') return { label: '就绪', className: 'is-ready' }
  if (status === 'blocked') return { label: '阻塞', className: 'is-warn' }
  return { label: '待准备', className: 'is-muted' }
}

function shortList(items: string[], limit = 6) {
  if (!items.length) return '无'
  const head = items.slice(0, limit).join('、')
  return items.length > limit ? `${head} 等 ${items.length} 项` : head
}

const DEFAULT_SUNO_MODEL_OPTIONS = [
  { value: 'chirp-v3-5', label: 'Suno v3.5' },
  { value: 'chirp-v4', label: 'Suno v4' },
  { value: 'chirp-v4-5', label: 'Suno v4.5' },
  { value: 'chirp-v4-5-plus', label: 'Suno v4.5+' },
]

function formatSunoModelLabel(model: string) {
  return DEFAULT_SUNO_MODEL_OPTIONS.find(option => option.value === model)?.label || model
}

export default function PostProductionPage() {
  const { id } = useParams<{ id: string }>()
  const selectedProject = getSelectedProject()
  const projectId = Number(id || selectedProject?.id || 0)
  const [workbench, setWorkbench] = useState<Workbench | null>(null)
  const [result, setResult] = useState<ExportResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [busyStage, setBusyStage] = useState('')
  const [uploadingStage, setUploadingStage] = useState('')
  const [render, setRender] = useState(false)
  const [audioStatus, setAudioStatus] = useState<Record<string, any>>({})
  const [musicSegments, setMusicSegments] = useState<any[]>([])
  const [genProvider, setGenProvider] = useState('cosyvoice')
  const [musicStyle, setMusicStyle] = useState('')
  const [musicInstruments, setMusicInstruments] = useState('')
  const [musicModel, setMusicModel] = useState('')
  const [previewAudio, setPreviewAudio] = useState<string | null>(null)
  const [dialogueProgress, setDialogueProgress] = useState('')
  const [sfxProgress, setSfxProgress] = useState('')
  const [musicProgress, setMusicProgress] = useState('')
  const [mixLevels, setMixLevels] = useState({ dialogue: -6, sfx: -12, music: -18 })
  const [normalizing, setNormalizing] = useState(false)
  const toast = useToast()

  const loadWorkbench = async () => {
    try {
      const res = await apiClient.get(`/post/${projectId}/workbench`)
      setWorkbench(res.data)
    } catch (e: any) {
      toast.error(e?.userMessage || e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (projectId > 0) {
      void loadWorkbench()
      return
    }
    setLoading(false)
  }, [projectId])

  // ── Audio status polling ──
  const loadAudioStatus = async () => {
    try {
      const res = await apiClient.get(`/post/${projectId}/audio/status`)
      setAudioStatus(res.data)
    } catch { /* non-critical */ }
  }
  const loadMusicSegments = async () => {
    try {
      const res = await apiClient.get(`/post/${projectId}/audio/music-segments`)
      setMusicSegments(res.data.segments || [])
    } catch { /* non-critical */ }
  }
  useEffect(() => {
    if (projectId > 0) {
      void loadAudioStatus()
      void loadMusicSegments()
    }
  }, [projectId])

  // ── Audio Generation Handlers ──
  const handleGenDialogue = async () => {
    setDialogueProgress('生成中...')
    try {
      const res = await apiClient.post(`/post/${projectId}/audio/dialogue`, { provider: genProvider })
      toast.success(res.data.message || `对白生成完成: ${res.data.succeeded}/${res.data.total}`)
      await loadAudioStatus()
      await loadWorkbench()
    } catch (e: any) { toast.error(e?.userMessage || e.message) }
    finally { setDialogueProgress('') }
  }

  const handleGenSingleDialogue = async (shotId: string) => {
    try {
      await apiClient.post(`/post/${projectId}/audio/dialogue/${encodeURIComponent(shotId)}?provider=${encodeURIComponent(genProvider)}`)
      toast.success('对白生成完成')
      await loadAudioStatus()
      await loadWorkbench()
    } catch (e: any) { toast.error(e?.userMessage || e.message) }
  }

  const handleGenSFX = async () => {
    setSfxProgress('生成中...')
    try {
      const res = await apiClient.post(`/post/${projectId}/audio/sfx`)
      toast.success(res.data.message || `音效生成完成: ${res.data.succeeded}/${res.data.total}`)
      await loadAudioStatus()
      await loadWorkbench()
    } catch (e: any) { toast.error(e?.userMessage || e.message) }
    finally { setSfxProgress('') }
  }

  const handleGenSingleSFX = async (shotId: string) => {
    try {
      await apiClient.post(`/post/${projectId}/audio/sfx/${encodeURIComponent(shotId)}`)
      toast.success('音效生成完成')
      await loadAudioStatus()
      await loadWorkbench()
    } catch (e: any) { toast.error(e?.userMessage || e.message) }
  }

  const handleGenMusic = async () => {
    setMusicProgress('生成中（配乐需 20-60 秒/段）...')
    try {
      const res = await apiClient.post(`/post/${projectId}/audio/music`, {
        style: musicStyle,
        instruments: musicInstruments,
        model: musicModel,
      })
      toast.success(res.data.message || `配乐生成完成: ${res.data.succeeded}/${res.data.total}`)
      await loadAudioStatus()
      await loadMusicSegments()
      await loadWorkbench()
    } catch (e: any) { toast.error(e?.userMessage || e.message) }
    finally { setMusicProgress('') }
  }

  const handleGenSingleMusic = async (segIdx: number) => {
    try {
      await apiClient.post(`/post/${projectId}/audio/music/${segIdx}`, {
        style: musicStyle,
        instruments: musicInstruments,
        model: musicModel,
      })
      toast.success('配乐段生成完成')
      await loadAudioStatus()
      await loadMusicSegments()
    } catch (e: any) { toast.error(e?.userMessage || e.message) }
  }

  const handleMix = async () => {
    try {
      const res = await apiClient.post(`/post/${projectId}/audio/mix`, mixLevels)
      if (!res.data.success) throw new Error(res.data.error || '混音失败')
      toast.success(res.data.message || '混音完成')
      if (res.data.project_relative_output_path) setPreviewAudio(res.data.project_relative_output_path)
      await loadAudioStatus()
      await loadWorkbench()
    } catch (e: any) { toast.error(e?.userMessage || e.message) }
  }

  const handleNormalize = async () => {
    setNormalizing(true)
    try {
      const res = await apiClient.post(`/post/${projectId}/audio/normalize`)
      if (!res.data.success) throw new Error(res.data.error || '响度均一化失败')
      toast.success(res.data.message || '响度均一化完成')
      await loadAudioStatus()
      await loadWorkbench()
    } catch (e: any) { toast.error(e?.userMessage || e.message) }
    finally { setNormalizing(false) }
  }

  const audioFileUrl = (path: string) => `/api/post/file?path=${encodeURIComponent(path)}`

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await apiClient.post(`/post/${projectId}/export?render=${render}`)
      setResult(res.data)
      if (res.data.workbench) setWorkbench(res.data.workbench)
      toast.success(res.data.message || '成片交付包已生成')
      await loadWorkbench()
    } catch (e: any) {
      toast.error(e?.userMessage || e.message)
    } finally {
      setExporting(false)
    }
  }

  const handlePrepareStage = async (stageKey: string) => {
    setBusyStage(stageKey)
    try {
      const res = await apiClient.post(`/post/${projectId}/stage/${stageKey}/prepare`)
      setWorkbench(res.data.workbench)
      toast.success(`${res.data.stage_label}工作文件已生成`)
    } catch (e: any) {
      toast.error(e?.userMessage || e.message)
    } finally {
      setBusyStage('')
    }
  }

  const handleCompleteStage = async (stageKey: string) => {
    setBusyStage(stageKey)
    try {
      const res = await apiClient.post(`/post/${projectId}/stage/${stageKey}/status`, { status: 'completed' })
      setWorkbench(res.data.workbench)
      toast.success('阶段已标记完成')
    } catch (e: any) {
      toast.error(e?.userMessage || e.message)
    } finally {
      setBusyStage('')
    }
  }

  const handleUploadStage = async (stageKey: string, file?: File) => {
    if (!file) return
    setUploadingStage(stageKey)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('artifact_type', 'uploaded')
      const res = await apiClient.post(`/post/${projectId}/stage/${stageKey}/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setWorkbench(res.data.workbench)
      toast.success('阶段产物已上传')
    } catch (e: any) {
      toast.error(e?.userMessage || e.message)
    } finally {
      setUploadingStage('')
    }
  }

  const renderPostTopbar = (readyForRender: boolean | null = null) => (
    <header className="video-topbar project-topbar">
      <div className="video-title-group">
        <div>
          <span>POST WORKBENCH</span>
          <h2>后期制作工作台</h2>
          <p>音频补修、配乐 Cue、精剪调色、交付包与最终合成</p>
        </div>
      </div>
      <div className="video-env-row">
        <Link to="/projects" className="video-back-link" title="返回项目">
          <IconArrowLeft size={16} />
          返回项目
        </Link>
        <span className="video-pill is-phase">
          Phase 5
        </span>
        <span className={`video-pill ${readyForRender === null ? 'is-running' : readyForRender ? 'is-live' : 'is-warn'}`}>
          {readyForRender === null ? '读取中' : readyForRender ? '可合成' : '待补齐'}
        </span>
        <Link to="/assets" className="video-action secondary">
          资产库管理中心
          <IconArrowRight size={14} />
        </Link>
      </div>
    </header>
  )

  if (loading) {
    return (
      <div className="video-gen-studio legacy-post-page post-production-page post-production-redesign animate-fade-in">
        {renderPostTopbar(null)}
        <section className="post-stage-board post-loading-stage-board" aria-label="后期制作工作台加载中">
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton" />
        </section>
        <section className="post-panel post-loading-panel">
          <div className="skeleton" />
          <div className="skeleton" />
        </section>
      </div>
    )
  }

  if (!workbench) {
    return (
      <div className="video-gen-studio legacy-post-page post-production-page post-production-redesign animate-fade-in">
        {renderPostTopbar(false)}
        <section className="post-readiness-card is-warn">
          <div>
            <IconAlert size={16} className="post-check-icon is-warn" />
            <span className="post-readiness-title">无法读取后期制作工作台</span>
          </div>
          <p className="post-readiness-note">
            后期制作工作台数据暂未返回。请确认后端服务与项目后期台账可用后刷新页面。
          </p>
          <button type="button" className="video-action secondary" onClick={loadWorkbench}>
            刷新状态
          </button>
        </section>
      </div>
    )
  }

  const { status } = workbench
  const downloadUrl = result?.zip_path ? `/api/post/download?path=${encodeURIComponent(result.zip_path)}` : ''
  const stageByKey = Object.fromEntries(workbench.stages.map(stage => [stage.key, stage]))
  const fileUrl = (path: string) => `/api/post/file?path=${encodeURIComponent(path)}`
  const artifactsFor = (stageKey: string) => workbench.workspace.artifacts.filter(artifact => artifact.stage === stageKey)
  const capabilities = workbench.audio_capabilities || {}
  const dialogueProvider = genProvider === 'elevenlabs' ? capabilities.elevenlabs : capabilities.cosyvoice
  const dialogueProviderReady = !!dialogueProvider?.configured
  const sfxReady = !!capabilities.elevenlabs?.configured && capabilities.elevenlabs?.sfx_supported !== false
  const musicReady = !!capabilities.suno?.configured
  const defaultMusicModel = capabilities.suno?.model || ''
  const musicModelChoices = Array.from(new Set([
    ...((Array.isArray(capabilities.suno?.model_options) ? capabilities.suno.model_options : []) as string[]),
    ...DEFAULT_SUNO_MODEL_OPTIONS.map(option => option.value),
    ...(musicModel ? [musicModel] : []),
  ].filter(Boolean)))
  const ffmpegReady = !!capabilities.ffmpeg?.configured
  const audioFileCount = Number(audioStatus.audio_file_count || 0)
  const mixCanRun = !!audioStatus.mix?.can_mix
  const mixBlockerText = (audioStatus.mix?.blockers || []).join('；')
  const mixPreviewPath = previewAudio || audioStatus.mix?.output_path || ''
  const renderAudioPlayer = (file?: AudioFile | null) => {
    if (!file?.path) {
      return <span className="post-audio-empty">未生成</span>
    }
    return (
      <div className="post-audio-player">
        <audio controls src={audioFileUrl(file.path)} className="w-full h-8" />
        <a href={fileUrl(file.path)} className="post-file-link">{file.name}</a>
      </div>
    )
  }
  const renderStageActions = (stageKey: string) => {
    const stage = stageByKey[stageKey]
    if (!stage) return null
    const blocked = stage.blockers.length > 0
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handlePrepareStage(stageKey)}
          disabled={busyStage === stageKey}
          className="btn btn-secondary"
        >
          <IconFile size={14} />
          {busyStage === stageKey ? '生成中...' : '生成本阶段文件'}
        </button>
        <label className={`btn btn-secondary cursor-pointer ${uploadingStage === stageKey ? 'opacity-60 pointer-events-none' : ''}`}>
          <IconUpload size={14} />
          {uploadingStage === stageKey ? '上传中...' : '上传产物'}
          <input type="file" className="hidden" onChange={event => handleUploadStage(stageKey, event.target.files?.[0])} />
        </label>
        <button
          type="button"
          onClick={() => handleCompleteStage(stageKey)}
          disabled={busyStage === stageKey || blocked}
          className="btn btn-secondary"
          title={blocked ? '存在阻塞项，暂不能标记完成' : '标记完成'}
        >
          <IconCheck size={14} />
          标记完成
        </button>
      </div>
    )
  }
  const renderStageFiles = (stageKey: string) => {
    const stage = stageByKey[stageKey]
    const generated = stage?.generated_files || []
    const artifacts = artifactsFor(stageKey)
    if (!generated.length && !artifacts.length) return null
    return (
      <div className="post-file-list">
        {generated.map(path => (
          <a key={path} href={fileUrl(path)} className="post-file-link">
            <IconDownload size={13} />
            {path.split(/[\\/]/).pop()}
          </a>
        ))}
        {artifacts.map(artifact => (
          <a key={artifact.id} href={fileUrl(artifact.path)} className="post-file-link">
            <IconDownload size={13} />
            {artifact.name}
            <span className="post-file-tag">上传产物</span>
          </a>
        ))}
      </div>
    )
  }

  return (
    <div className="video-gen-studio legacy-post-page post-production-page post-production-redesign animate-fade-in">
      {renderPostTopbar(status.ready_for_render)}

      <section className="post-stage-board">
        {workbench.stages.map((stage, index) => {
          const tone = stageTone(stage.status)
          const StageIcon = stageIcons[stage.key] || IconReview
          const deps: Record<string, string[]> = {
            audio_repair: [],
            music: ['audio_repair'],
            post_edit: ['audio_repair', 'music'],
            delivery: ['post_edit'],
          }
          const stageDeps = deps[stage.key] || []
          const blockedBy = stageDeps.filter(depKey => {
            const dep = workbench.stages.find(s => s.key === depKey)
            return dep && dep.status !== 'completed'
          })
          return (
            <div key={stage.key} className={`post-stage-card ${tone.className}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`post-stage-icon ${tone.className}`}>
                    <StageIcon size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="post-stage-order">{index + 1}</p>
                    <h3 className="post-stage-title">{stage.label}</h3>
                  </div>
                </div>
                <span className={`post-stage-status ${tone.className}`}>{tone.label}</span>
              </div>
              <p className="post-stage-desc">{stage.description}</p>
              {stageDeps.length > 0 && (
                <p className="post-stage-meta">
                  依赖：{stageDeps.map(d => workbench.stages.find(s => s.key === d)?.label || d).join(' → 已完成')}
                </p>
              )}
              {blockedBy.length > 0 && (
                <p className="post-stage-blocker">
                  阻塞：等待 {blockedBy.map(d => workbench.stages.find(s => s.key === d)?.label || d).join('、')} 完成
                </p>
              )}
              <div className="mt-4 flex items-end justify-between">
                <span className="post-stage-meta">条目</span>
                <span className="post-stage-count">{stage.item_count}</span>
              </div>
              <p className="post-stage-meta">
                文件 {stage.generated_files.length} · 产物 {stage.artifact_count}
              </p>
            </div>
          )
        })}
      </section>

      <section className={`post-readiness-card ${status.ready_for_export ? 'is-ready' : 'is-warn'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {status.ready_for_export ? <IconCheck size={16} className="post-check-icon is-ready" /> : <IconAlert size={16} className="post-check-icon is-warn" />}
            <span className="post-readiness-title">
              {status.ready_for_export ? '后期链路已就绪，可以生成成片交付包' : '后期链路仍有未完成项'}
            </span>
          </div>
          <p className="post-readiness-note">交付目录：{status.post_dir}</p>
        </div>
        {!status.ready_for_export && (
          <p className="post-status-warning">
            未完成：{shortList([...status.missing_review, ...status.missing_video_files])}
          </p>
        )}
        {status.completed_missing_video_files.length > 0 && (
          <p className="post-readiness-note">
            已忽略 {status.completed_missing_video_files.length} 条历史缺文件视频记录，不参与后期导出。
          </p>
        )}
      </section>

      <section className="post-capability-grid">
        {[
          ['cosyvoice', '中文对白'],
          ['elevenlabs', '音效/多语言'],
          ['suno', 'AI 配乐'],
          ['ffmpeg', '混音/合成'],
        ].map(([key, label]) => {
          const item = capabilities[key]
          const ok = !!item?.configured
          return (
            <div key={key} className={`post-capability-card ${ok ? 'is-ready' : 'is-warn'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="post-capability-title">{label}</span>
                <span className={`post-capability-badge ${ok ? 'is-ready' : 'is-warn'}`}>{ok ? '可用' : '未配置'}</span>
              </div>
              <p className="post-capability-desc">
                {item?.label || key} · {ok ? '可执行生成/处理' : item?.action || '需配置后使用'}
              </p>
            </div>
          )
        })}
      </section>

      <section className="post-workbench-grid">
        <div className="post-primary-stack">
          {/* ── 音频补修 (Phase 5B) ── */}
          <div className="post-panel post-panel-audio">
            <div className="post-panel-head">
              <div>
                <h3 className="post-panel-title">音频补修</h3>
                <p className="post-panel-desc">
                  对白、声线、环境音和动作音效的 AI 生成与补修。
                  {audioStatus.dialogue && <span> · 已生成 {audioStatus.dialogue.completed}/{audioStatus.dialogue.total} 可合成对白</span>}
                  {audioStatus.dialogue?.issues > 0 && <span> · 待核对白 {audioStatus.dialogue.issues}</span>}
                  {audioStatus.sfx && <span> · 已生成 {audioStatus.sfx.completed}/{audioStatus.sfx.total} 音效</span>}
                </p>
              </div>
              <span className="post-panel-count">
                可合成 {workbench.audio_repair.dialogue_count} · 待核 {workbench.audio_repair.dialogue_issue_count || 0} · 音效 {workbench.audio_repair.sfx_count}
              </span>
            </div>

            {/* AI 生成工具栏 */}
            <div className="post-ai-toolbar">
              <span>AI 生成</span>
              <select value={genProvider} onChange={e => setGenProvider(e.target.value)}>
                <option value="cosyvoice">CosyVoice (中文)</option>
                <option value="elevenlabs">ElevenLabs (多语言)</option>
              </select>
              <button
                onClick={handleGenDialogue}
                disabled={!!dialogueProgress || workbench.audio_repair.dialogue_count === 0 || !dialogueProviderReady}
                title={!dialogueProviderReady ? (dialogueProvider?.action || '当前对白生成服务未配置') : ''}
                className="btn btn-secondary text-xs"
              >
                <IconZap size={12} />
                {dialogueProgress || `生成全部对白 (${workbench.audio_repair.dialogue_count})`}
              </button>
              <button
                onClick={handleGenSFX}
                disabled={!!sfxProgress || workbench.audio_repair.sfx_count === 0 || !sfxReady}
                title={!sfxReady ? (capabilities.elevenlabs?.sfx_supported === false ? '当前 ElevenLabs 配置为多语言 TTS，不支持音效生成' : (capabilities.elevenlabs?.action || '当前音效生成服务未配置')) : ''}
                className="btn btn-secondary text-xs"
              >
                <IconZap size={12} />
                {sfxProgress || `生成全部音效 (${workbench.audio_repair.sfx_count})`}
              </button>
              <button
                onClick={handleNormalize}
                disabled={normalizing || !ffmpegReady || audioFileCount === 0}
                title={!ffmpegReady ? '未检测到 FFmpeg' : audioFileCount === 0 ? '还没有可处理的音频文件' : ''}
                className="btn btn-secondary text-xs"
              >
                {normalizing ? '处理中...' : '响度均一化'}
              </button>
            </div>
            {!dialogueProviderReady && (
              <p className="post-status-warning">
                当前 {dialogueProvider?.label || genProvider} 未配置，已禁用对白生成按钮：{dialogueProvider?.action || '请先配置对应服务'}。
              </p>
            )}
            {capabilities.elevenlabs?.configured && capabilities.elevenlabs?.sfx_supported === false && (
              <p className="post-status-warning">
                当前 ElevenLabs 已接入 {capabilities.elevenlabs.provider || 'shengsuan'} / {capabilities.elevenlabs.model || 'TTS'}，可用于多语言对白；音效生成仍需官方 SFX 或独立音效模型。
              </p>
            )}
            {(workbench.audio_repair.dialogue_issue_count || 0) > 0 && (
              <p className="post-status-warning">
                有 {workbench.audio_repair.dialogue_issue_count} 条对白只有表演/声音提示或空角色前缀，已移出 TTS 队列，需要先人工补成真实台词或上传人工修补产物。
              </p>
            )}

            <div className="mb-4">
              {renderStageActions('audio_repair')}
              {renderStageFiles('audio_repair')}
            </div>
            <div className="post-audio-grid">
              <div className="post-table-shell">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      {['镜号', '对白', '声线', '音频', '操作'].map(h => <th key={h} className="p-2 text-left font-medium">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {workbench.audio_repair.dialogue_cues.slice(0, 12).map(cue => (
                      <tr key={cue.shot_id}>
                        <td className="p-2 post-table-id">{cue.shot_id}</td>
                        <td className="p-2 max-w-[240px] post-table-text" title={cue.raw_dialogue || cue.dialogue}>
                          <div className="truncate">{cue.spoken_text || cue.dialogue}</div>
                          {cue.performance_note && <div className="post-table-muted truncate">表演：{cue.performance_note}</div>}
                        </td>
                        <td className={`p-2 ${cue.voice_tone ? 'post-table-text' : 'post-table-warn'}`}>{cue.voice_tone || '未绑定'}</td>
                        <td className="p-2">{renderAudioPlayer(cue.generated_file)}</td>
                        <td className="p-2">
                          <button
                            onClick={() => handleGenSingleDialogue(cue.shot_id)}
                            disabled={!dialogueProviderReady}
                            className="post-inline-action"
                          >
                            {cue.generated ? '重生成' : '生成'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {workbench.audio_repair.dialogue_cues.length === 0 && <tr><td className="p-3 text-center post-table-muted" colSpan={5}>暂无对白 Cue</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="space-y-2">
                {workbench.audio_repair.voice_profiles.slice(0, 5).map(profile => (
                  <div key={profile.char_id} className="post-mini-card">
                    <p className="post-profile-title">{profile.char_id} · {profile.name}</p>
                    <p className="post-profile-desc">{profile.voice_tone}</p>
                  </div>
                ))}
                {workbench.audio_repair.voice_profiles.length === 0 && <p className="post-muted">暂无角色声线记录。</p>}
                {!!workbench.audio_repair.dialogue_issues?.length && (
                  <div className="post-mini-card post-sfx-card">
                    <p className="post-mini-title">待人工修订对白</p>
                    {workbench.audio_repair.dialogue_issues.slice(0, 6).map(cue => (
                      <div key={cue.shot_id} className="post-sfx-row">
                        <div className="flex items-start justify-between gap-2 text-xs">
                          <span className="post-sfx-id">{cue.shot_id}</span>
                          <span className="post-sfx-text">{cue.message}</span>
                        </div>
                        <p className="post-table-muted mt-1 truncate" title={cue.raw_dialogue}>原字段：{cue.raw_dialogue}</p>
                      </div>
                    ))}
                  </div>
                )}
                {/* SFX cues */}
                {workbench.audio_repair.sfx_cues.length > 0 && (
                  <div className="post-mini-card post-sfx-card">
                    <p className="post-mini-title">音效队列</p>
                    {workbench.audio_repair.sfx_cues.slice(0, 6).map(cue => (
                      <div key={cue.shot_id} className="post-sfx-row">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="post-sfx-id">{cue.shot_id}</span>
                          <span className="post-sfx-text">
                            {cue.sfx}
                            {cue.source === 'inferred' && <span className="post-table-muted"> · 推导/{cue.confidence || 'medium'}</span>}
                          </span>
                          <button
                            onClick={() => handleGenSingleSFX(cue.shot_id)}
                            disabled={!sfxReady}
                            className="post-inline-action"
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

          {/* ── 配乐制作 (Phase 5C) ── */}
          <div className="post-panel post-panel-music">
            <div className="post-panel-head">
              <div>
                <h3 className="post-panel-title">配乐制作</h3>
                <p className="post-panel-desc">
                  AI 生成跨镜连续配乐，按情绪曲线分段。
                  {audioStatus.music && <span> · 已生成 {audioStatus.music.completed}/{audioStatus.music.total} 段</span>}
                </p>
              </div>
              <span className="post-panel-count">{workbench.music.cues.length} 条 Cue · {musicSegments.length} 情绪段</span>
            </div>

            {/* AI 配乐工具栏 */}
            <div className="post-ai-toolbar">
              <span>配乐</span>
              <input type="text" placeholder="风格 (如 电影感写实)" value={musicStyle} onChange={e => setMusicStyle(e.target.value)} />
              <input type="text" placeholder="乐器 (如 管弦乐)" value={musicInstruments} onChange={e => setMusicInstruments(e.target.value)} />
              <select
                value={musicModel}
                onChange={e => setMusicModel(e.target.value)}
                disabled={!!musicProgress}
                title="选择提交给 Suno 或代理服务的配乐模型"
              >
                <option value="">
                  模型：默认{defaultMusicModel ? `（${formatSunoModelLabel(defaultMusicModel)}）` : ''}
                </option>
                {musicModelChoices.map(model => (
                  <option key={model} value={model}>{formatSunoModelLabel(model)}</option>
                ))}
              </select>
              <button
                onClick={handleGenMusic}
                disabled={!!musicProgress || musicSegments.length === 0 || !musicReady}
                title={!musicReady ? (capabilities.suno?.action || '当前配乐生成服务未配置') : ''}
                className="btn btn-secondary text-xs"
              >
                <IconZap size={12} />
                {musicProgress || `生成全部配乐 (${musicSegments.length} 段)`}
              </button>
            </div>
            {!musicReady && (
              <p className="post-status-warning">
                Suno 未配置，已禁用 AI 配乐生成：{capabilities.suno?.action || '请先配置 SUNO_API_KEY + SUNO_BASE_URL'}。
              </p>
            )}

            <div className="mb-4">
              {renderStageActions('music')}
              {renderStageFiles('music')}
            </div>

            {/* Music segments with generate buttons */}
            {musicSegments.length > 0 && (
              <div className="post-music-segment-grid">
                {musicSegments.map((seg, i) => (
                  <div key={i} className="post-music-segment-card">
                    <div className="flex items-center justify-between gap-2">
                      <span className="post-music-time">{seg.start_sec}s - {seg.end_sec}s</span>
                      <span className="post-music-duration">{seg.duration_sec}s</span>
                      <button
                        onClick={() => handleGenSingleMusic(i)}
                        disabled={!musicReady}
                        className="post-inline-action"
                      >
                        {seg.generated ? '重生成' : '生成'}
                      </button>
                    </div>
                    <p className="post-music-mood">{seg.mood}</p>
                    {seg.narrative_beat && <p className="post-music-beat">{seg.narrative_beat}</p>}
                    <p className="post-music-prompt">{seg.prompt}</p>
                    <div className="mt-2">{renderAudioPlayer(seg.generated_file)}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {workbench.music.mood_counts.map(item => (
                <span key={item.mood} className="post-mood-badge">{item.mood} · {item.count}</span>
              ))}
            </div>
          </div>

          {/* ── 混音 (Phase 5D) ── */}
          <div className="post-panel post-panel-mix">
            <div className="post-panel-head">
              <div>
                <h3 className="post-panel-title">混音</h3>
                <p className="post-panel-desc">对白/音效/配乐三轨混音 + 响度标准化 (-16 LUFS)</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: '对白轨', key: 'dialogue', db: mixLevels.dialogue },
                { label: '音效轨', key: 'sfx', db: mixLevels.sfx },
                { label: '配乐轨', key: 'music', db: mixLevels.music },
              ].map(track => (
                <div key={track.key} className="post-mix-track">
                  <p className={`post-mix-label is-${track.key}`}>{track.label}</p>
                  <input type="range" min="-24" max="0" value={track.db} onChange={e => setMixLevels(prev => ({ ...prev, [track.key]: Number(e.target.value) }))} className="w-full mt-1" />
                  <p className="post-mix-db">{track.db} dB</p>
                </div>
              ))}
            </div>
            <button
              onClick={handleMix}
              disabled={!ffmpegReady || !mixCanRun}
              title={!ffmpegReady ? '未检测到 FFmpeg，无法混音' : !mixCanRun ? (mixBlockerText || '还没有可混音的音频文件') : ''}
              className="btn btn-primary text-sm disabled:opacity-50"
            >
              <IconZap size={14} /> 自动混音
            </button>
            {!mixCanRun && (
              <p className="post-status-warning mt-3">
                混音暂不可用：{mixBlockerText || '还没有可混音的对白、音效或配乐文件'}。
              </p>
            )}
            {mixPreviewPath && (
              <div className="post-mini-card mt-4">
                <p className="post-profile-desc mb-2">当前混音轨 · 会在导出 final_cut.mp4 时自动合入</p>
                <audio controls src={audioFileUrl(mixPreviewPath)} className="w-full" />
                <a href={fileUrl(mixPreviewPath)} className="post-file-link">
                  下载 mixed_audio.wav
                </a>
              </div>
            )}
          </div>

          <div className="post-panel post-panel-timeline">
            <div className="post-panel-head">
              <div>
                <h3 className="post-panel-title">后期制作时间线</h3>
                <p className="post-panel-desc">审核通过镜头会进入最终剪辑决策表和字幕草稿。</p>
              </div>
              <span className="post-panel-count">{workbench.post_edit.selected_clips}/{status.total_shots} 镜</span>
            </div>
            <div className="mb-4">
              {renderStageActions('post_edit')}
              {renderStageFiles('post_edit')}
            </div>
            <div className="post-table-shell post-timeline-table">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    {['镜号', '时间', '决策', '对白/音频'].map(h => <th key={h} className="p-2 text-left font-medium">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {workbench.post_edit.timeline.map(item => (
                    <tr key={`${item.episode}-${item.shot_id}`}>
                      <td className="p-2 post-table-id">{item.shot_id}</td>
                      <td className="p-2 post-table-muted">{item.start_sec}s - {item.end_sec}s</td>
                      <td className="p-2"><StatusBadge status={item.decision} /></td>
                      <td className="p-2 max-w-[220px] truncate post-table-text">{item.dialogue || item.sfx || item.bgm_mood || '-'}</td>
                    </tr>
                  ))}
                  {workbench.post_edit.timeline.length === 0 && <tr><td className="p-4 text-center post-table-muted" colSpan={4}>暂无已审核选片。</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="post-side-stack">
          <div className="post-panel post-delivery-panel">
            <h3 className="post-panel-title">成片交付包</h3>
            <p className="post-panel-desc mb-4">
              生成 ZIP、剪辑表、字幕、音频补修、配乐 Cue、后期计划和平台外精剪调色清单。
            </p>
            <div className="mb-5">
              {renderStageActions('delivery')}
              {renderStageFiles('delivery')}
            </div>
            <div className="space-y-2 mb-5">
              {workbench.delivery.files.map(file => (
                <div key={file} className="post-delivery-file">
                  <IconCheck size={13} className="post-check-icon is-ready" />
                  <span>{file}</span>
                </div>
              ))}
            </div>
            <label className="post-checkbox-row">
              <input
                type="checkbox"
                checked={render}
                onChange={e => setRender(e.target.checked)}
                className="post-checkbox"
              />
              同时合成 final_cut.mp4 预览
            </label>
            <button onClick={handleExport} disabled={exporting || !status.ready_for_export} className="btn btn-primary w-full justify-center">
              <IconDownload size={14} />
              {exporting ? '生成中...' : render ? '生成交付包 + final_cut.mp4' : '生成交付包'}
            </button>
            {!status.ready_for_export && (
              <p className="post-status-warning">需要先完成质量审核并确保视频文件存在。</p>
            )}
          </div>

          <div className="post-panel post-external-panel">
            <h3 className="post-panel-title">平台外精剪调色</h3>
            <div className="space-y-2 mt-4">
              {workbench.delivery.external_finishing.map(item => (
                <div key={item} className="post-external-item">
                  <span className="post-external-dot" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {result && (
            <div className="post-panel post-result-panel animate-slide-up">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <IconCheck size={16} className="post-check-icon is-ready" />
                    <span className="post-result-title">{result.message}</span>
                  </div>
                  <p className="post-result-path">{result.export_dir}</p>
                </div>
              </div>
              {result.render_error && (
                <div className="post-result-warning">
                  {result.render_error}
                </div>
              )}
              <p className="post-result-meta">
                时间线：{result.manifest.timeline_duration_sec}s · {result.manifest.timeline.length} 镜
              </p>
              {downloadUrl && (
                <a href={downloadUrl} className="btn btn-primary w-full justify-center">
                  <IconDownload size={14} /> 下载 ZIP
                </a>
              )}
            </div>
          )}
        </aside>
      </section>
    </div>
  )
}
