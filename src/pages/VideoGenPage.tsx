import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, CheckCircle2, Settings, User, Building2, Gem, ImageIcon } from 'lucide-react';
import ProcessStepBar from '@/components/ProcessStepBar';
import AppHeader from '@/components/AppHeader';
import { fetchImageAssets, fetchVideoGenShots, fetchVideoTask, fetchVideoVersions, submitVideoGeneration } from '@/api/videoGen';
import { imageAssetUrl } from '@/api/imageAssets';
import { useWorkflowProject } from '@/hooks/useWorkflowProject';
import { sampleShots as mockVideoShots, videoVersions } from '@/mocks/videoGen';
import { showcaseMedia } from '@/mocks/showcaseMedia';

function assetKind(assetType: string): 'character' | 'scene' | 'prop' {
  if (assetType.includes('character') || assetType.includes('emotion')) return 'character';
  if (assetType.includes('scene') || assetType.includes('overhead') || assetType.includes('camera')) return 'scene';
  return 'prop';
}

export default function VideoGenPage() {
  const { project, projectQuery } = useWorkflowProject();
  const isMockProject = Boolean(project?.isMock);
  const [selectedMockShotId, setSelectedMockShotId] = useState(mockVideoShots[0]?.id ?? '');
  const [mockNotice, setMockNotice] = useState('');
  const queryClient = useQueryClient();
  const [selectedShotId, setSelectedShotId] = useState<number | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [prompt, setPrompt] = useState('');
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [seedanceModel, setSeedanceModel] = useState<'fast' | 'pro'>('fast');
  const [provider, setProvider] = useState<'volcengine' | 'runninghub' | 'happy_horse'>('volcengine');
  const [selectedReferenceIds, setSelectedReferenceIds] = useState<number[]>([]);
  const shotsQuery = useQuery({ queryKey: ['video-shots', project?.id], queryFn: () => fetchVideoGenShots(project!.id), enabled: Boolean(project && !isMockProject) });
  const imagesQuery = useQuery({ queryKey: ['images', project?.id], queryFn: () => fetchImageAssets(project!.id), enabled: Boolean(project && !isMockProject) });
  const videoQuery = useQuery({ queryKey: ['video-versions', project?.id, selectedShotId], queryFn: () => fetchVideoVersions(project!.id, selectedShotId || undefined), enabled: Boolean(project && selectedShotId && !isMockProject) });
  const taskQuery = useQuery({ queryKey: ['video-task', activeTaskId], queryFn: () => fetchVideoTask(activeTaskId!), enabled: Boolean(activeTaskId), refetchInterval: (query) => query.state.data?.status === 'queued' || query.state.data?.status === 'running' ? 1500 : false });
  const generateMutation = useMutation({
    mutationFn: (shotId: number) => submitVideoGeneration(shotId, { referenceAssetIds: selectedReferenceIds, customPrompt: prompt, resolution, aspectRatio: project?.aspectRatio || '16:9', seedanceModel: provider === 'happy_horse' ? 'fast' : seedanceModel, provider }),
    onSuccess: (result) => { if (result.task_id) setActiveTaskId(result.task_id); queryClient.invalidateQueries({ queryKey: ['video-versions', project?.id, selectedShotId] }); },
  });

  useEffect(() => { if (selectedShotId == null && shotsQuery.data?.[0]) setSelectedShotId(shotsQuery.data[0].id); }, [selectedShotId, shotsQuery.data]);
  useEffect(() => { if (videoQuery.data?.[0] && selectedVersionId == null) setSelectedVersionId(videoQuery.data[0].id); }, [selectedVersionId, videoQuery.data]);
  useEffect(() => { if (taskQuery.data?.status === 'completed' || taskQuery.data?.status === 'failed') queryClient.invalidateQueries({ queryKey: ['video-versions', project?.id, selectedShotId] }); }, [project?.id, queryClient, selectedShotId, taskQuery.data?.status]);

  const selectedShot = shotsQuery.data?.find((shot) => shot.id === selectedShotId);
  const imageAssets = imagesQuery.data || [];
  const firstFrame = useMemo(() => imageAssets.find((asset) => asset.asset_type === 'video_first_frame' && Number(asset.shot_id) === selectedShotId && asset.effective_status === 'completed' && asset.file_exists), [imageAssets, selectedShotId]);
  const eligibleReferenceAssets = useMemo(() => imageAssets.filter((asset) => asset.effective_status === 'completed' && asset.file_exists), [imageAssets]);
  useEffect(() => {
    if (!firstFrame) return;
    setSelectedReferenceIds((current) => current.length ? current : [firstFrame.id]);
  }, [firstFrame]);
  const toggleReference = (assetId: number) => setSelectedReferenceIds((current) => current.includes(assetId) ? current.filter((id) => id !== assetId) : [...current, assetId]);
  const error = projectQuery.error || shotsQuery.error || imagesQuery.error || videoQuery.error || taskQuery.error || generateMutation.error;
  const errorMessage = error instanceof Error ? error.message : '';

  if (!project) return <div className="flex-1 flex items-center justify-center text-sm text-[var(--text-secondary)]">请先在项目页选择一个项目。</div>;
  if (isMockProject) {
    const selectedMockShot = mockVideoShots.find((shot) => shot.id === selectedMockShotId) ?? mockVideoShots[0];
    const preview = showcaseMedia.find((media) => media.kind === 'video');
    const firstFrame = showcaseMedia.find((media) => media.id === 'first-frame');
    return (
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <AppHeader title={project.name} subtitle="视频生成 · 本地样例" />
        <main className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col min-h-0">
          <ProcessStepBar />
          <p className="mb-4 rounded-xl border border-[var(--accent-primary)]/25 bg-[var(--accent-primary-bg)] px-4 py-3 text-sm text-[var(--text-secondary)]">LOCAL MOCK · 使用本地图片与视频演示镜头选择、提示词编辑和任务状态，不会提交计费任务。</p>
          {mockNotice && <p className="mb-4 rounded-lg border border-[var(--color-success)]/25 bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--color-success)]">{mockNotice}</p>}
          {selectedMockShot && <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
            <div className="w-[200px] flex flex-col gap-3 overflow-y-auto flex-shrink-0 pr-1">
              {mockVideoShots.map((shot) => <button key={shot.id} onClick={() => setSelectedMockShotId(shot.id)} className={`p-3 rounded-xl border text-left transition-all ${selectedMockShot.id === shot.id ? 'bg-[var(--bg-card)] border-[var(--accent-primary)]' : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-default)]'}`}><div className="flex items-center justify-between"><span className="text-sm font-medium text-[var(--text-primary)]">{shot.code}</span>{shot.status === 'completed' && <CheckCircle2 size={15} className="text-[var(--color-success)]" />}</div><span className="block mt-1 text-xs text-[var(--text-muted)]">{shot.duration} · {shot.progress}%</span></button>)}
            </div>
            <div className="flex-1 min-w-0 overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
              <div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="text-base font-semibold text-[var(--text-primary)]">{selectedMockShot.code}</h3><p className="mt-1 text-xs text-[var(--text-muted)]">{selectedMockShot.duration} · 本地样例资产参考</p></div><div className="flex flex-wrap gap-2">{videoVersions.map((version) => <button key={version.id} className={`rounded-md border px-2.5 py-1 text-xs ${version.isCurrent ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-bg)] text-[var(--accent-primary)]' : 'border-[var(--border-subtle)] text-[var(--text-secondary)]'}`}>{version.name}</button>)}</div></div>
              {preview && <video controls src={preview.src} poster={preview.poster} className="mb-4 aspect-video w-full rounded-lg bg-black object-contain" />}
              <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="输入本地样例提示词，体验提交前编辑..." className="min-h-36 w-full resize-y rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-input)] p-4 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]" />
              <div className="mt-3 flex justify-end border-t border-[var(--border-subtle)] pt-3"><button onClick={() => setMockNotice(prompt.trim() ? `已记录 ${selectedMockShot.code} 的本地提示词预览。` : `已将 ${selectedMockShot.code} 标记为本地样例生成完成。`)} className="rounded-lg bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">模拟本地生成</button></div>
            </div>
            <aside className="w-[280px] shrink-0 overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4"><h4 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">首帧图片</h4><div className="aspect-video overflow-hidden rounded-lg bg-[var(--bg-surface)]">{firstFrame && <img src={firstFrame.src} alt="本地样例首帧" className="h-full w-full object-cover" />}</div></aside>
          </div>}
        </main>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <AppHeader title={project.name} subtitle="视频生成" />
      <main className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col min-h-0">
        <ProcessStepBar />
        <section className="mb-4 flex flex-wrap items-end justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3"><div className="flex flex-wrap items-end gap-3"><label className="grid gap-1 text-xs text-[var(--text-muted)]"><span>清晰度</span><select value={resolution} onChange={(event) => setResolution(event.target.value as '720p' | '1080p')} className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)]"><option value="720p">720p</option><option value="1080p">1080p</option></select></label><label className="grid gap-1 text-xs text-[var(--text-muted)]"><span>Seedance 模型</span><select value={seedanceModel} onChange={(event) => setSeedanceModel(event.target.value as 'fast' | 'pro')} disabled={provider === 'happy_horse'} className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] disabled:opacity-50"><option value="fast">Fast</option><option value="pro">Pro</option></select></label><label className="grid gap-1 text-xs text-[var(--text-muted)]"><span>生成服务</span><select value={provider} onChange={(event) => setProvider(event.target.value as 'volcengine' | 'runninghub' | 'happy_horse')} className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)]"><option value="volcengine">Volcengine</option><option value="runninghub">RunningHub</option><option value="happy_horse">HappyHorse</option></select></label></div><p className="text-xs text-[var(--text-secondary)]">沿用旧前端参数：{resolution} · {project?.aspectRatio || '16:9'} · {provider} / {provider === 'happy_horse' ? 'fast' : seedanceModel} · 已选 {selectedReferenceIds.length} 张参考资产</p></section>
        <section className="mb-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-[var(--text-primary)]">视频参考资产</p><p className="mt-1 text-xs text-[var(--text-secondary)]">请选择本镜头需要传给后端的首帧、角色、场景或机位参考；默认优先选择视频首帧。</p></div><span className="text-xs text-[var(--accent-primary)]">{selectedReferenceIds.length} 已选择</span></div><div className="mt-3 flex gap-2 overflow-x-auto pb-1">{eligibleReferenceAssets.slice(0, 24).map((asset) => <button key={asset.id} type="button" onClick={() => toggleReference(asset.id)} className={`w-20 shrink-0 overflow-hidden rounded-lg border p-1 text-left ${selectedReferenceIds.includes(asset.id) ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-bg)]' : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'}`}><div className="aspect-square overflow-hidden rounded bg-[var(--bg-input)]">{imageAssetUrl(asset) ? <img src={imageAssetUrl(asset)} alt={asset.name} className="h-full w-full object-cover" /> : <ImageIcon size={18} className="m-auto mt-6 text-[var(--text-muted)]" />}</div><span className="mt-1 block truncate text-[10px] text-[var(--text-secondary)]" title={asset.name}>{asset.name}</span></button>)}</div></section>
        {errorMessage && <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{errorMessage}</p>}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative"><button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)]"><span>项目镜头</span><ChevronDown size={16} className="text-[var(--text-muted)]" /></button></div>
          <div className="relative"><button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)]"><Settings size={14} className="text-[var(--text-muted)]" /><span>Seedance Fast</span><ChevronDown size={16} className="text-[var(--text-muted)]" /></button></div>
          <span className="text-sm text-[var(--text-muted)] ml-2">视频每 1 秒消耗以实际生成计费为准。</span>
        </div>
        {shotsQuery.isLoading ? <p className="text-sm text-[var(--text-secondary)]">正在加载镜头与资产...</p> : !selectedShot ? <p className="text-sm text-[var(--text-secondary)]">当前项目尚无镜头，请先在视频创作页生成剧本分镜。</p> : (
          <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
            <div className="w-[200px] flex flex-col gap-3 overflow-y-auto flex-shrink-0 pr-1">
              {(shotsQuery.data || []).map((shot, index) => <button key={shot.id} onClick={() => { setSelectedShotId(shot.id); setSelectedVersionId(null); }} className={`p-3 rounded-xl border transition-all duration-300 text-left relative overflow-hidden ${selectedShotId === shot.id ? 'bg-[var(--bg-card)] border-[var(--accent-primary)] shadow-lg shadow-[var(--accent-primary)]/10' : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-default)]'}`} style={{ animationDelay: `${index * 0.05}s` }}><div className="flex items-center justify-between"><span className="text-sm font-medium text-[var(--text-primary)]">{shot.code}</span>{shot.status === 'completed' && <CheckCircle2 size={15} className="text-[var(--color-success)]" />}</div><span className="block text-xs text-[var(--text-muted)] mt-1">{shot.duration}</span></button>)}
            </div>
            <div className="flex-1 min-w-0 bg-[var(--bg-card)] rounded-xl p-5 border border-[var(--border-subtle)] overflow-y-auto">
              <div className="flex items-center justify-between gap-3 mb-4"><div><h3 className="text-base font-semibold text-[var(--text-primary)]">{selectedShot.code}</h3><p className="text-xs text-[var(--text-muted)] mt-1">{selectedShot.duration} · 使用真实项目资产作为参考</p></div><div className="flex flex-wrap gap-2">{(videoQuery.data || []).map((version) => <button key={version.id} onClick={() => setSelectedVersionId(version.id)} className={`px-2.5 py-1 rounded-md text-xs border ${selectedVersionId === version.id ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--accent-primary-bg)]' : 'border-[var(--border-subtle)] text-[var(--text-secondary)]'}`}>{version.name}</button>)}</div></div>
              <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="可选：输入本次提交给生产端的附加视频提示词..." className="w-full min-h-44 resize-y rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] p-4 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]" />
              {taskQuery.data && <p className={`mt-3 text-sm ${taskQuery.data.status === 'failed' ? 'text-red-500' : 'text-[var(--text-secondary)]'}`}>任务 {taskQuery.data.status} · {Math.round(taskQuery.data.progress || 0)}% {taskQuery.data.progress_message || taskQuery.data.error_message || ''}</p>}
              <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-[var(--border-subtle)]">{selectedReferenceIds.length === 0 && <p className="mr-auto text-xs text-amber-500">请先在上方选择至少一张已完成的首帧、角色、场景或机位参考资产。</p>}<button onClick={() => generateMutation.mutate(selectedShot.id)} disabled={generateMutation.isPending || selectedReferenceIds.length === 0} className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary-dim)] text-white disabled:opacity-50 hover:shadow-lg hover:shadow-[var(--accent-primary)]/30 transition-all">{generateMutation.isPending ? '提交中...' : '开始生成'}</button></div>
            </div>
            <div className="w-[320px] flex flex-col gap-4 flex-shrink-0 overflow-y-auto pl-1">
              <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-subtle)]"><h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">首帧图片</h4><div className="aspect-[16/9] bg-[var(--bg-surface)] rounded-lg flex items-center justify-center border border-[var(--border-subtle)] mb-3 overflow-hidden">{firstFrame ? <img src={imageAssetUrl(firstFrame)} alt="首帧参考" className="w-full h-full object-cover" /> : <div className="text-center"><ImageIcon size={28} className="mx-auto text-[var(--text-muted)]" /><span className="text-xs text-[var(--text-muted)] mt-2 block">未生成</span></div>}</div>{!firstFrame && <p className="text-xs text-[var(--accent-primary)]">建议先生成首帧图片，视频生成更符合您的期望。</p>}</div>
              <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-subtle)] flex-1"><h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">图片资产</h4><div className="space-y-3">{imageAssets.slice(0, 30).map((asset) => { const kind = assetKind(asset.asset_type); return <div key={asset.id} className="bg-[var(--bg-surface)] rounded-lg p-3 border border-[var(--border-subtle)]"><div className="aspect-[4/3] bg-[var(--bg-input)] rounded-lg flex items-center justify-center mb-2 overflow-hidden">{asset.file_exists && asset.effective_status === 'completed' ? <img src={imageAssetUrl(asset)} alt={asset.name} className="w-full h-full object-cover" /> : kind === 'character' ? <User size={24} className="text-[var(--text-muted)]" /> : kind === 'scene' ? <Building2 size={24} className="text-[var(--text-muted)]" /> : <Gem size={24} className="text-[var(--text-muted)]" />}</div><div className="flex items-center gap-2"><span className="text-xs text-[var(--accent-primary)] font-medium">{asset.asset_type}</span><span className="text-xs text-[var(--text-secondary)]">{kind === 'character' ? '角色' : kind === 'scene' ? '场景' : '道具'}</span></div><p className="text-xs text-[var(--text-primary)] mt-1 truncate">{asset.name}</p></div>; })}</div></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
