import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, CircleAlert, FolderOpen, LoaderCircle, Sparkles } from 'lucide-react';
import VideoTopBar from '@/components/VideoTopBar';
import ProcessStepBar from '@/components/ProcessStepBar';
import CreationInput, { type CreationInputOptions } from '@/components/CreationInput';
import ScriptSettings from '@/components/ScriptSettings';
import EpisodeList from '@/components/EpisodeList';
import { fetchProject } from '@/api/projects';
import {
  cancelEpisodeDocumentTask,
  composeEpisodeDocument,
  deriveEpisodeWorkspace,
  fetchActiveEpisodeDocumentTask,
  fetchEpisodeDocumentTask,
  fetchScriptDocument,
  generateScriptSetup,
  queueEpisodeDocument,
  saveScriptDocument,
  saveScriptSetup,
  type EpisodeDocumentTaskResponse,
  type ScriptProvider,
  type ScriptSetup,
} from '@/api/script';
import type { Project } from '@/types/project';
import { getSelectedProject, setSelectedProject } from '@/stores/selectedProject';

function resolveProvider(modelKey: string): ScriptProvider {
  if (modelKey === 'deepseek') return 'deepseek';
  if (modelKey === 'openai' || modelKey.startsWith('gpt')) return 'openai';
  return 'claude';
}

function savedProvider(project: Project | undefined): ScriptProvider {
  const candidate = project?.brief?.script_provider;
  if (candidate === 'openai' || candidate === 'deepseek' || candidate === 'claude') return candidate;
  return 'claude';
}

function providerLabel(provider: ScriptProvider): string {
  if (provider === 'openai') return 'GPT-5';
  if (provider === 'deepseek') return 'DeepSeek Chat';
  return 'DeepSeek V4 Pro';
}

function taskIsActive(status?: string): boolean {
  return status === 'queued' || status === 'running' || status === 'canceling';
}

function taskStatusLabel(status?: string): string {
  if (status === 'queued') return '排队中';
  if (status === 'running') return '生成中';
  if (status === 'canceling') return '取消中';
  if (status === 'completed') return '已完成';
  if (status === 'failed') return '失败';
  if (status === 'canceled') return '已取消';
  return status || '等待中';
}

function readCreativeBrief(project: Project | undefined, setup: ScriptSetup | null): string {
  const candidates = [setup?.source_brief, project?.brief?.creative_brief, project?.brief?.description];
  return candidates.find((value): value is string => typeof value === 'string' && value.trim().length > 0)?.trim() || '';
}

const MOCK_SETUP: ScriptSetup = {
  title: '本地示例剧本', logline: '本地示例仅用于展示界面。', synopsis: 'LOCAL MOCK 项目不会请求后端，也不会写入业务台账。', genre: '示例', style_type: '示例风格', tone: '示例',
  characters: [{ name: '示例角色', role: '主角', description: '仅用于本地展示。', personality: '冷静', relationships: '待生成', arc: '待生成' }],
  episodes: [{ episode: 1, title: '示例首集', summary: '本地示例分集内容。' }],
};

function readScriptSetup(project: Project | undefined): ScriptSetup | null {
  const candidate = project?.brief?.script_setup;
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null;
  const setup = candidate as Partial<ScriptSetup>;
  if (!setup.title || !setup.synopsis || !Array.isArray(setup.characters) || !Array.isArray(setup.episodes)) return null;
  return setup as ScriptSetup;
}

export default function VideoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const intentProject = (location.state as { project?: Project; showScriptWorkspace?: boolean } | null)?.project ?? null;
  const showScriptWorkspace = Boolean((location.state as { showScriptWorkspace?: boolean } | null)?.showScriptWorkspace);
  const project = intentProject ?? getSelectedProject();
  if (intentProject) setSelectedProject(intentProject);
  const isMockProject = Boolean(project?.isMock);
  const [blueprintConfirmed, setBlueprintConfirmed] = useState(false);
  const [trackedTaskId, setTrackedTaskId] = useState<number | null>(null);
  const [latestTask, setLatestTask] = useState<EpisodeDocumentTaskResponse | null>(null);

  const projectQuery = useQuery({
    queryKey: ['project', project?.id],
    queryFn: () => fetchProject(project!.id),
    enabled: Boolean(project && !isMockProject),
  });
  const documentQuery = useQuery({
    queryKey: ['script-document', project?.id],
    queryFn: () => fetchScriptDocument(project!.id),
    enabled: Boolean(project && !isMockProject),
  });
  const activeTaskQuery = useQuery({
    queryKey: ['script-episode-task-active', project?.id],
    queryFn: () => fetchActiveEpisodeDocumentTask(project!.id),
    enabled: Boolean(project && !isMockProject),
    refetchInterval: 4_000,
  });

  const currentProject = projectQuery.data ?? project ?? undefined;
  const setup = readScriptSetup(currentProject);
  const document = documentQuery.data;
  const provider = savedProvider(currentProject);
  const workspaceEpisodes = useMemo(() => (
    setup && document ? deriveEpisodeWorkspace(document.content, setup.episodes, currentProject?.episodeCount || setup.episodes.length || 1) : []
  ), [currentProject?.episodeCount, document, setup]);
  const totalEpisodes = currentProject?.episodeCount || setup?.episodes.length || 1;
  const generatedEpisodes = workspaceEpisodes.filter((episode) => episode.status === 'generated').length;
  const nextPendingEpisode = workspaceEpisodes.find((episode) => episode.status === 'pending')?.episode || (workspaceEpisodes.length ? totalEpisodes + 1 : 1);
  const watchedTaskId = trackedTaskId ?? activeTaskQuery.data?.task.id ?? null;

  const taskQuery = useQuery({
    queryKey: ['script-episode-task', project?.id, watchedTaskId],
    queryFn: () => fetchEpisodeDocumentTask(project!.id, watchedTaskId!),
    enabled: Boolean(project && watchedTaskId && !isMockProject),
    refetchInterval: watchedTaskId ? 2_500 : false,
  });

  useEffect(() => {
    if (activeTaskQuery.data?.task && trackedTaskId == null) setTrackedTaskId(activeTaskQuery.data.task.id);
  }, [activeTaskQuery.data?.task, trackedTaskId]);

  useEffect(() => {
    const payload = taskQuery.data;
    if (!payload) return;
    setLatestTask(payload);
    if (!taskIsActive(payload.task.status)) {
      setTrackedTaskId(null);
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['project', project?.id] }),
        queryClient.invalidateQueries({ queryKey: ['script-document', project?.id] }),
        queryClient.invalidateQueries({ queryKey: ['script-episode-task-active', project?.id] }),
      ]);
    }
  }, [project?.id, queryClient, taskQuery.data]);

  const legacyBlueprintMutation = useMutation({
    mutationFn: async ({ options, prompt }: { options: CreationInputOptions; prompt: string }) => {
      if (!project) throw new Error('请先选择项目。');
      const creativeBrief = prompt.trim();
      if (!creativeBrief) throw new Error('请先填写创作描述。');
      return generateScriptSetup({ project_id: project.id, creative_brief: creativeBrief, provider: resolveProvider(options.modelKey) });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project', project?.id] });
    },
  });

  const saveSetupMutation = useMutation({
    mutationFn: (nextSetup: ScriptSetup) => saveScriptSetup(project!.id, nextSetup),
    onSuccess: async () => {
      setBlueprintConfirmed(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['project', project?.id] }),
        queryClient.invalidateQueries({ queryKey: ['script-document', project?.id] }),
      ]);
    },
  });

  const saveEpisodeMutation = useMutation({
    mutationFn: ({ episode, content }: { episode: number; content: string }) => {
      const selectedEpisode = workspaceEpisodes.find((item) => item.episode === episode);
      if (!selectedEpisode) throw new Error('未找到要保存的分集剧本。');
      return saveScriptDocument(project!.id, {
        title: document?.title || currentProject?.name || 'AI 分集剧本',
        content: composeEpisodeDocument(workspaceEpisodes.map((item) => item.episode === episode ? { ...item, content } : item)),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['script-document', project?.id] }),
  });

  const queueMutation = useMutation({
    mutationFn: async ({ start, end }: { start: number; end: number }) => {
      if (!project || !setup) throw new Error('请先完成全剧创作设定。');
      const creativeBrief = readCreativeBrief(currentProject, setup);
      if (!creativeBrief) throw new Error('缺少创意源稿，暂时无法启动分集剧本生产。');
      return queueEpisodeDocument(project.id, {
        creative_brief: creativeBrief,
        provider,
        title: setup.title || project.name,
        start_episode: start,
        end_episode: end,
        merge_with_latest: true,
      });
    },
    onSuccess: async (payload) => {
      setLatestTask(payload);
      setTrackedTaskId(payload.task.id);
      setBlueprintConfirmed(false);
      await queryClient.invalidateQueries({ queryKey: ['script-episode-task-active', project?.id] });
    },
  });

  const cancelTaskMutation = useMutation({
    mutationFn: () => cancelEpisodeDocumentTask(project!.id, watchedTaskId!),
    onSuccess: (payload) => {
      setLatestTask(payload);
      void queryClient.invalidateQueries({ queryKey: ['script-episode-task-active', project?.id] });
    },
  });

  const handleSaveSetup = (nextSetup: ScriptSetup) => {
    if (document && !window.confirm('保存全剧设定会清空当前已生成的剧本、分镜及下游内容。确认继续吗？')) return;
    saveSetupMutation.mutate(nextSetup);
  };
  const startQueue = (start: number, requestedEnd: number) => {
    const end = Math.min(totalEpisodes, requestedEnd);
    queueMutation.mutate({ start, end });
  };

  const activeOrLatestTask = taskQuery.data ?? latestTask ?? activeTaskQuery.data;
  const isQueueBusy = queueMutation.isPending || taskIsActive(activeOrLatestTask?.task.status);
  const isComplete = Boolean(document && workspaceEpisodes.length && generatedEpisodes >= totalEpisodes);
  const error = legacyBlueprintMutation.error || saveSetupMutation.error || saveEpisodeMutation.error || queueMutation.error || cancelTaskMutation.error || projectQuery.error || documentQuery.error || activeTaskQuery.error || taskQuery.error;
  const errorMessage = error instanceof Error ? error.message : '';

  if (!project) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        <VideoTopBar title="剧本创作" progress={0} subtitle="未选择项目" />
        <main className="flex-1 flex items-center justify-center p-8 overflow-auto"><div className="empty-frame flex flex-col items-center justify-center gap-5 text-center max-w-md w-full px-6 py-16 rounded-2xl"><div className="w-16 h-16 rounded-2xl bg-[var(--accent-primary-bg)] flex items-center justify-center"><FolderOpen size={28} className="text-[var(--accent-primary)]" /></div><div className="space-y-1.5"><h2 className="text-lg font-semibold text-[var(--text-primary)]">暂未选择项目进行创作</h2><p className="text-sm text-[var(--text-secondary)] leading-relaxed">请从首页输入创作需求，先生成并确认全剧蓝图。</p></div><button onClick={() => navigate('/')} className="btn btn-ghost btn-sm flex items-center gap-1.5"><ArrowRight size={14} />前往创作中心</button></div></main>
      </div>
    );
  }

  const creationOptions: CreationInputOptions = {
    type: currentProject?.contentType || 'AI短剧', typeKey: currentProject?.contentType || 'ai_short_drama',
    style: currentProject?.visualStyle || '电影感写实', styleKey: 'cinematic_realism',
    format: (currentProject?.aspectRatio || '9:16') + ' · ' + (currentProject?.episodeCount || 12) + '集 · ' + (currentProject?.episodeDurationSec || 120) + 's',
    aspectRatio: currentProject?.aspectRatio || '9:16', episodeCount: currentProject?.episodeCount || 12, duration: currentProject?.episodeDurationSec || 120,
    model: providerLabel(provider), modelKey: provider,
  };
  const isLoadingWorkspace = Boolean(showScriptWorkspace && (projectQuery.isLoading || documentQuery.isLoading));
  const nextBatchEnd = Math.min(totalEpisodes, nextPendingEpisode + 11);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <VideoTopBar title={currentProject?.name || project.name} progress={isComplete ? 52 : document ? 36 : setup ? 20 : 14} subtitle={isMockProject ? '本地示例创作' : '剧本创作'} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <ProcessStepBar />
        {errorMessage && <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{errorMessage}</p>}
        {isMockProject ? (
          <>
            <p className="mb-4 rounded-xl border border-[var(--accent-primary)]/25 bg-[var(--accent-primary-bg)] px-4 py-3 text-sm text-[var(--text-secondary)]">LOCAL MOCK：本地示例只展示界面，不会调用后端或写入业务数据。</p>
            <ScriptSettings setup={MOCK_SETUP} />
            <EpisodeList episodes={[{ episode: 1, title: '示例首集', summary: '本地示例分集内容。', content: '本地示例剧本正文。', status: 'generated' }]} />
          </>
        ) : isLoadingWorkspace ? (
          <div className="glass-panel p-6 text-sm text-[var(--text-secondary)]">正在读取项目与剧本创作状态…</div>
        ) : !setup ? (
          <>
            <CreationInput options={creationOptions} defaultValue={readCreativeBrief(currentProject, null)} onGenerate={(options, prompt) => legacyBlueprintMutation.mutate({ options, prompt })} isGenerating={legacyBlueprintMutation.isPending} generateLabel="生成全剧创作方案" generateHint="先生成全剧蓝图，确认后再开始试写与批量生产。" />
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 text-sm text-[var(--text-secondary)]"><p className="font-medium text-[var(--text-primary)] mb-1">当前项目还没有全剧创作蓝图</p><p>请先生成并审核剧名、梗概、角色设定和分集计划；分集剧本不会在此步骤自动生成。</p></div>
          </>
        ) : (
          <>
            <ScriptSettings setup={setup} isSaving={saveSetupMutation.isPending} onSave={handleSaveSetup} />

            {activeOrLatestTask && (
              <section className="mb-6 overflow-hidden rounded-xl border border-[var(--accent-primary)]/25 bg-[var(--bg-card)]">
                <div className="flex flex-col gap-3 border-b border-[var(--border-subtle)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3"><div className="mt-0.5 rounded-lg bg-[var(--accent-primary-bg)] p-2">{taskIsActive(activeOrLatestTask.task.status) ? <LoaderCircle size={17} className="animate-spin text-[var(--accent-primary)]" /> : activeOrLatestTask.task.status === 'completed' ? <CheckCircle2 size={17} className="text-[var(--color-success)]" /> : <CircleAlert size={17} className="text-amber-500" />}</div><div><p className="text-sm font-semibold text-[var(--text-primary)]">分集剧本生产任务 · {taskStatusLabel(activeOrLatestTask.task.status)}</p><p className="mt-1 text-xs text-[var(--text-muted)]">第 {activeOrLatestTask.episode_range?.start || '–'}–{activeOrLatestTask.episode_range?.end || '–'} 集 · {activeOrLatestTask.task.progress_message || '等待任务状态更新'}</p></div></div>
                  {taskIsActive(activeOrLatestTask.task.status) && <button type="button" onClick={() => cancelTaskMutation.mutate()} disabled={cancelTaskMutation.isPending || !watchedTaskId} className="btn btn-secondary btn-sm disabled:cursor-not-allowed disabled:opacity-50">{cancelTaskMutation.isPending ? '正在取消…' : '取消任务'}</button>}
                </div>
                <div className="px-4 py-3"><div className="h-2 overflow-hidden rounded-full bg-[var(--bg-input)]"><div className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-500" style={{ width: Math.max(0, Math.min(100, activeOrLatestTask.task.progress * 100)) + '%' }} /></div><p className="mt-2 text-xs text-[var(--text-muted)]">进度 {Math.round((activeOrLatestTask.task.progress || 0) * 100)}%{activeOrLatestTask.task.error_message ? ' · ' + activeOrLatestTask.task.error_message : ''}</p></div>
              </section>
            )}

            {!document ? (
              activeOrLatestTask?.task.status === 'completed' ? <div className="rounded-xl border border-[var(--accent-primary)]/25 bg-[var(--accent-primary-bg)] px-4 py-3 text-sm text-[var(--text-secondary)]">分集任务已完成，正在载入可编辑剧本文档…</div> : <section className="mb-6 rounded-xl border border-[var(--accent-primary)]/30 bg-[var(--accent-primary-bg)] p-5 lg:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-primary)]">Human Approval Gate</p><h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">审核全剧蓝图后，再开始试写</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">请检查剧名、梗概、角色关系和 {totalEpisodes} 集分集计划。确认后建议先试写第 1 集或前 3 集，验证成稿质量再启动批量生产。</p></div><div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-secondary)]"><span className="block text-[var(--text-muted)]">本次剧本模型</span><strong className="mt-1 block text-sm text-[var(--text-primary)]">{providerLabel(provider)}</strong></div></div>
                <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] p-3 text-sm text-[var(--text-secondary)]"><input type="checkbox" checked={blueprintConfirmed} onChange={(event) => setBlueprintConfirmed(event.target.checked)} className="mt-0.5 accent-[var(--accent-primary)]" /><span>我已审核全剧设定，确认角色、故事主线和分集节奏可以作为后续剧本生产依据。</span></label>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap"><button type="button" disabled={!blueprintConfirmed || isQueueBusy} onClick={() => startQueue(1, 1)} className="btn btn-primary btn-sm disabled:cursor-not-allowed disabled:opacity-50"><Sparkles size={14} />确认并试写第 1 集</button>{totalEpisodes > 1 && <button type="button" disabled={!blueprintConfirmed || isQueueBusy} onClick={() => startQueue(1, Math.min(3, totalEpisodes))} className="btn btn-secondary btn-sm disabled:cursor-not-allowed disabled:opacity-50">试写前 {Math.min(3, totalEpisodes)} 集</button>}{totalEpisodes > 3 && <button type="button" disabled={!blueprintConfirmed || isQueueBusy} onClick={() => startQueue(1, Math.min(12, totalEpisodes))} className="btn btn-secondary btn-sm disabled:cursor-not-allowed disabled:opacity-50">队列生产第 1–{Math.min(12, totalEpisodes)} 集</button>}</div>
              </section>
            ) : (
              <>
                <EpisodeList episodes={workspaceEpisodes} isSaving={saveEpisodeMutation.isPending} onSaveEpisode={(episode, content) => saveEpisodeMutation.mutate({ episode, content })} />
                {!isComplete ? <section className="mt-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-primary)]">Queued Production</p><h2 className="mt-1 text-base font-semibold text-[var(--text-primary)]">已完成 {generatedEpisodes}/{totalEpisodes} 集，继续分批生产</h2><p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">建议审阅已生成内容后，再继续投递下一批。每个队列任务最多生产 12 集，并支持后台继续、刷新恢复和取消。</p></div><div className="flex flex-wrap gap-2"><button type="button" disabled={isQueueBusy || nextPendingEpisode > totalEpisodes} onClick={() => startQueue(nextPendingEpisode, nextPendingEpisode)} className="btn btn-secondary btn-sm disabled:cursor-not-allowed disabled:opacity-50">生成第 {nextPendingEpisode} 集</button><button type="button" disabled={isQueueBusy || nextPendingEpisode > totalEpisodes} onClick={() => startQueue(nextPendingEpisode, nextBatchEnd)} className="btn btn-primary btn-sm disabled:cursor-not-allowed disabled:opacity-50">队列生产第 {nextPendingEpisode}–{nextBatchEnd} 集</button></div></div></section> : <section className="mt-6 rounded-xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 p-5"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="flex items-start gap-3"><CheckCircle2 size={20} className="mt-0.5 text-[var(--color-success)]" /><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-success)]">Script Ready</p><h2 className="mt-1 text-base font-semibold text-[var(--text-primary)]">全剧 {totalEpisodes} 集已齐备，可进入分镜创作</h2><p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">请先确认关键集正文已保存；进入分镜页后，可以根据定稿剧本生成结构化镜头并继续人工审核。</p></div></div><button type="button" onClick={() => { if (window.confirm('确认当前剧本已定稿，并进入分镜创作吗？')) navigate('/storyboard'); }} className="btn btn-primary btn-sm">定稿进入分镜 <ArrowRight size={14} /></button></div></section>}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
