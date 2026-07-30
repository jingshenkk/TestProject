import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, CircleAlert, FolderOpen, LoaderCircle, Sparkles } from 'lucide-react';
import VideoTopBar from '@/components/VideoTopBar';
import ProcessStepBar from '@/components/ProcessStepBar';
import EpisodeList from '@/components/EpisodeList';
import { useWorkflowProject } from '@/hooks/useWorkflowProject';
import { composeEpisodeDocument, deriveEpisodeWorkspace, fetchActiveEpisodeDocumentTask, fetchScriptDocument, queueEpisodeDocument, saveScriptDocument, type ScriptEpisodePlan, type ScriptProvider } from '@/api/script';
import type { Project } from '@/types/project';

function providerFor(project?: Project | null): ScriptProvider {
  const value = project?.brief?.script_provider;
  return value === 'openai' || value === 'deepseek' || value === 'claude' ? value : 'claude';
}
function providerLabel(provider: ScriptProvider): string {
  return provider === 'openai' ? 'GPT-5' : provider === 'deepseek' ? 'DeepSeek Chat' : 'DeepSeek V4 Pro';
}
function sourceBrief(project?: Project | null): string {
  const brief = project?.brief || {};
  if (typeof brief.creative_brief === 'string' && brief.creative_brief.trim()) return brief.creative_brief.trim();
  return Object.entries(brief)
    .filter(([key, value]) => !['source', 'script_provider', 'creation_status', 'creation_error', 'script_setup'].includes(key) && typeof value === 'string' && value.trim())
    .map(([key, value]) => key + '：' + String(value).trim())
    .join('\n');
}

export default function ManualScriptPageV3() {
  const { projectId, project, projectQuery } = useWorkflowProject();
  const routerNavigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmed, setConfirmed] = useState(false);
  const navigate = (to: string) => routerNavigate(to === '/storyboard' ? `/projects/${projectId}/storyboard` : to);

  const creationStatus = typeof project?.brief?.creation_status === 'string' ? project.brief.creation_status : 'ready';
  const creationError = typeof project?.brief?.creation_error === 'string' ? project.brief.creation_error : '';
  const ready = creationStatus === 'ready';
  const provider = providerFor(project);
  const prompt = sourceBrief(project);
  const totalEpisodes = Math.max(1, project?.episodeCount || 1);
  const plans = useMemo<ScriptEpisodePlan[]>(() => Array.from({ length: totalEpisodes }, (_, index) => ({ episode: index + 1, title: '第' + (index + 1) + '集', summary: '根据确认的项目 Brief 生成剧本文本。' })), [totalEpisodes]);
  const documentQuery = useQuery({ queryKey: ['script-document', projectId], queryFn: () => fetchScriptDocument(projectId), enabled: projectId > 0 && ready, refetchInterval: ready ? 4_000 : false });
  const activeTaskQuery = useQuery({ queryKey: ['script-episode-task-active', projectId], queryFn: () => fetchActiveEpisodeDocumentTask(projectId), enabled: projectId > 0 && ready, refetchInterval: ready ? 2_500 : false });
  const episodes = useMemo(() => documentQuery.data ? deriveEpisodeWorkspace(documentQuery.data.content, plans, totalEpisodes) : [], [documentQuery.data, plans, totalEpisodes]);
  const generatedEpisodes = episodes.filter((item) => item.status === 'generated').length;
  const nextEpisode = episodes.find((item) => item.status === 'pending')?.episode || totalEpisodes + 1;
  const queue = useMutation({
    mutationFn: (range: { start: number; end: number }) => {
      if (!project || !prompt) throw new Error('项目缺少创意 Brief。');
      return queueEpisodeDocument(projectId, { creative_brief: prompt, provider, title: project.name, start_episode: range.start, end_episode: range.end, merge_with_latest: true });
    },
    onSuccess: () => {
      setConfirmed(false);
      void queryClient.invalidateQueries({ queryKey: ['script-episode-task-active', projectId] });
    },
  });
  const save = useMutation({
    mutationFn: ({ episode, content }: { episode: number; content: string }) => saveScriptDocument(projectId, { title: project?.name || '项目剧本', content: composeEpisodeDocument(episodes.map((item) => item.episode === episode ? { ...item, content } : item)) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['script-document', projectId] }),
  });
  const error = projectQuery.error || documentQuery.error || activeTaskQuery.error || queue.error || save.error;
  const errorText = error instanceof Error ? error.message : '';
  const activeTask = activeTaskQuery.data?.task;
  const busy = queue.isPending || ['queued', 'running', 'canceling'].includes(activeTask?.status || '');

  if (!projectId) return <div className="flex-1 flex flex-col min-w-0"><VideoTopBar title="剧本创作" progress={0} subtitle="未选择项目" /><main className="flex flex-1 items-center justify-center p-8"><div className="empty-frame max-w-md rounded-2xl px-6 py-16 text-center"><FolderOpen size={30} className="mx-auto text-[var(--accent-primary)]" /><h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">暂未选择项目</h2><button onClick={() => navigate('/')} className="btn btn-primary btn-sm mt-5">前往创建项目<ArrowRight size={14} /></button></div></main></div>;
  if (projectQuery.isLoading && !project) return <div className="flex-1 flex flex-col min-w-0"><VideoTopBar title="项目加载中" progress={0} subtitle="剧本创作" /><main className="flex-1 p-8"><div className="glass-panel p-6 text-sm text-[var(--text-secondary)]">正在读取项目…</div></main></div>;
  if (creationStatus === 'generating') return <div className="flex-1 flex flex-col min-w-0"><VideoTopBar title={project?.name || '项目已创建'} progress={12} subtitle="剧本创作" /><main className="flex-1 p-8"><section className="mx-auto max-w-3xl rounded-2xl border border-[var(--accent-primary)]/30 bg-[var(--accent-primary-bg)] p-7 text-center"><LoaderCircle size={28} className="mx-auto animate-spin text-[var(--accent-primary)]" /><p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-primary)]">Project Persisted</p><h1 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">项目已创建，正在生成 Brief 建议</h1><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">现在刷新页面或切换其它模块都不会丢失该项目。返回这个带项目 ID 的地址后，会继续读取生成状态。</p></section></main></div>;
  if (creationStatus === 'failed') return <div className="flex-1 flex flex-col min-w-0"><VideoTopBar title={project?.name || '项目'} progress={12} subtitle="剧本创作" /><main className="flex-1 p-8"><section className="mx-auto max-w-3xl rounded-2xl border border-red-500/30 bg-red-500/10 p-7"><CircleAlert size={26} className="text-red-500" /><h1 className="mt-3 text-lg font-semibold text-[var(--text-primary)]">项目已创建，但 Brief 建议生成失败</h1><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{creationError || '请稍后重新打开项目。'}</p></section></main></div>;

  return <div className="flex-1 flex flex-col min-w-0"><VideoTopBar title={project?.name || '项目'} progress={documentQuery.data ? 52 : 25} subtitle="剧本创作" /><main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8"><ProcessStepBar />{errorText && <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{errorText}</p>}<section className="mb-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-primary)]">Brief Confirmation</p><h1 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">确认项目 Brief 后，手动生成剧本</h1><div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4"><div><p className="text-xs text-[var(--text-muted)]">内容类型</p><p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{project?.contentType}</p></div><div><p className="text-xs text-[var(--text-muted)]">生产规格</p><p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{project?.aspectRatio} · {totalEpisodes} 集 · {project?.episodeDurationSec}s</p></div><div><p className="text-xs text-[var(--text-muted)]">目标平台</p><p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{project?.targetPlatform || '待确认'}</p></div><div><p className="text-xs text-[var(--text-muted)]">剧本模型</p><p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{providerLabel(provider)}</p></div></div><div className="mt-5 grid gap-3 md:grid-cols-2">{Object.entries(project?.brief || {}).filter(([key, value]) => !['creative_brief', 'script_provider', 'source', 'creation_status', 'creation_error', 'script_setup'].includes(key) && typeof value === 'string' && value.trim()).map(([key, value]) => <div key={key} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] p-3"><p className="text-xs text-[var(--text-muted)]">{key}</p><p className="mt-1 text-sm leading-6 text-[var(--text-primary)]">{String(value)}</p></div>)}</div></section>{activeTask && <section className="mb-6 rounded-xl border border-[var(--accent-primary)]/25 bg-[var(--bg-card)] p-4"><div className="flex items-center gap-3">{busy ? <LoaderCircle size={18} className="animate-spin text-[var(--accent-primary)]" /> : <CheckCircle2 size={18} className="text-[var(--color-success)]" />}<div><p className="text-sm font-semibold text-[var(--text-primary)]">剧本生成任务</p><p className="mt-1 text-xs text-[var(--text-muted)]">{activeTask.progress_message || activeTask.status}</p></div></div></section>}{!documentQuery.data ? <section className="rounded-2xl border border-[var(--accent-primary)]/30 bg-[var(--accent-primary-bg)] p-5"><h2 className="text-lg font-semibold text-[var(--text-primary)]">手动生成剧本</h2><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">生成时会读取已持久化的项目 Brief、规格、视觉方向和原始创意，不会再次重置这些设置。</p><label className="mt-4 flex gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-3 text-sm text-[var(--text-secondary)]"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-0.5 accent-[var(--accent-primary)]" /><span>我已确认项目 Brief、规格和视觉方向可以作为剧本生成依据。</span></label><button type="button" disabled={!confirmed || busy || !prompt} onClick={() => queue.mutate({ start: 1, end: totalEpisodes })} className="btn btn-primary mt-4 disabled:cursor-not-allowed disabled:opacity-50">{queue.isPending ? <><LoaderCircle size={15} className="animate-spin" />正在提交…</> : <><Sparkles size={15} />手动生成剧本（{totalEpisodes} 集）</>}</button></section> : <><EpisodeList episodes={episodes} isSaving={save.isPending} onSaveEpisode={(episode, content) => save.mutate({ episode, content })} />{generatedEpisodes < totalEpisodes ? <button type="button" disabled={busy} onClick={() => queue.mutate({ start: nextEpisode, end: totalEpisodes })} className="btn btn-primary mt-6">继续生成第 {nextEpisode}–{totalEpisodes} 集</button> : <button type="button" onClick={() => navigate('/storyboard')} className="btn btn-primary mt-6">进入分镜<ArrowRight size={14} /></button>}</>}</main></div>;
}
