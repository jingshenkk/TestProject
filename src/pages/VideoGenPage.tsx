import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, CheckCircle2, Settings, User, Building2, Gem, ImageIcon } from 'lucide-react';
import ProcessStepBar from '@/components/ProcessStepBar';
import AppHeader from '@/components/AppHeader';
import { fetchImageAssets, fetchVideoGenShots, fetchVideoTask, fetchVideoVersions, submitVideoGeneration } from '@/api/videoGen';
import { imageAssetUrl } from '@/api/imageAssets';
import { getSelectedProject } from '@/stores/selectedProject';

function assetKind(assetType: string): 'character' | 'scene' | 'prop' {
  if (assetType.includes('character') || assetType.includes('emotion')) return 'character';
  if (assetType.includes('scene') || assetType.includes('overhead') || assetType.includes('camera')) return 'scene';
  return 'prop';
}

export default function VideoGenPage() {
  const project = getSelectedProject();
  const queryClient = useQueryClient();
  const [selectedShotId, setSelectedShotId] = useState<number | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [prompt, setPrompt] = useState('');
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const shotsQuery = useQuery({ queryKey: ['video-shots', project?.id], queryFn: () => fetchVideoGenShots(project!.id), enabled: Boolean(project) });
  const imagesQuery = useQuery({ queryKey: ['images', project?.id], queryFn: () => fetchImageAssets(project!.id), enabled: Boolean(project) });
  const videoQuery = useQuery({ queryKey: ['video-versions', project?.id, selectedShotId], queryFn: () => fetchVideoVersions(project!.id, selectedShotId || undefined), enabled: Boolean(project && selectedShotId) });
  const taskQuery = useQuery({ queryKey: ['video-task', activeTaskId], queryFn: () => fetchVideoTask(activeTaskId!), enabled: Boolean(activeTaskId), refetchInterval: (query) => query.state.data?.status === 'queued' || query.state.data?.status === 'running' ? 1500 : false });
  const generateMutation = useMutation({
    mutationFn: (shotId: number) => submitVideoGeneration(shotId, { referenceAssetIds: (imagesQuery.data || []).filter((asset) => asset.effective_status === 'completed' && asset.file_exists).slice(0, 6).map((asset) => asset.id), customPrompt: prompt, resolution: '1080p', aspectRatio: project?.aspectRatio || '16:9' }),
    onSuccess: (result) => { if (result.task_id) setActiveTaskId(result.task_id); queryClient.invalidateQueries({ queryKey: ['video-versions', project?.id, selectedShotId] }); },
  });

  useEffect(() => { if (selectedShotId == null && shotsQuery.data?.[0]) setSelectedShotId(shotsQuery.data[0].id); }, [selectedShotId, shotsQuery.data]);
  useEffect(() => { if (videoQuery.data?.[0] && selectedVersionId == null) setSelectedVersionId(videoQuery.data[0].id); }, [selectedVersionId, videoQuery.data]);
  useEffect(() => { if (taskQuery.data?.status === 'completed' || taskQuery.data?.status === 'failed') queryClient.invalidateQueries({ queryKey: ['video-versions', project?.id, selectedShotId] }); }, [project?.id, queryClient, selectedShotId, taskQuery.data?.status]);

  const selectedShot = shotsQuery.data?.find((shot) => shot.id === selectedShotId);
  const imageAssets = imagesQuery.data || [];
  const firstFrame = useMemo(() => imageAssets.find((asset) => asset.asset_type === 'video_first_frame' && Number(asset.shot_id) === selectedShotId && asset.effective_status === 'completed' && asset.file_exists), [imageAssets, selectedShotId]);
  const error = shotsQuery.error || imagesQuery.error || videoQuery.error || taskQuery.error || generateMutation.error;
  const errorMessage = error instanceof Error ? error.message : '';

  if (!project) return <div className="flex-1 flex items-center justify-center text-sm text-[var(--text-secondary)]">请先在项目页选择一个项目。</div>;
  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <AppHeader title={project.name} subtitle="视频生成" />
      <main className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col min-h-0">
        <ProcessStepBar />
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
              <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-[var(--border-subtle)]"><button onClick={() => generateMutation.mutate(selectedShot.id)} disabled={generateMutation.isPending} className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary-dim)] text-white disabled:opacity-50 hover:shadow-lg hover:shadow-[var(--accent-primary)]/30 transition-all">{generateMutation.isPending ? '提交中...' : '开始生成'}</button></div>
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
