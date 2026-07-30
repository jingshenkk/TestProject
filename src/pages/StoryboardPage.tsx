import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RefreshCw } from 'lucide-react';
import type { Shot } from '@/components/ShotCard';
import StoryboardTopBar from '@/components/StoryboardTopBar';
import ProcessStepBar from '@/components/ProcessStepBar';
import StoryboardSidebar, { type StoryboardEpisodeItem } from '@/components/StoryboardSidebar';
import ShotCard from '@/components/ShotCard';
import EmptyStoryboard from '@/components/EmptyStoryboard';
import ShotEditModal from '@/components/ShotEditModal';
import Modal from '@/components/Modal';
import { convertScriptDocument, fetchScriptDocument, fetchShotList, generateShotList, toStoryboardShot, updateStoryboardShot, type ScriptProvider } from '@/api/script';
import { useWorkflowProject } from '@/hooks/useWorkflowProject';
import { workflowPath } from '@/lib/projectWorkflow';
import { sampleShots } from '@/mocks/storyboardShots';
import { storyboardEpisodes } from '@/mocks/storyboardEpisodes';

function projectBriefText(brief?: Record<string, unknown>): string {
  if (!brief) return '';
  return [brief.logline, brief.synopsis, brief.description, brief.creative_brief]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join('\n');
}

function formatSeconds(value: number): string {
  return value.toFixed(value % 1 ? 1 : 0) + 's';
}

export default function StoryboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { projectId, project, projectQuery } = useWorkflowProject();
  const isMockProject = Boolean(project?.isMock);
  const [activeEpisode, setActiveEpisode] = useState<number | undefined>();
  const [editingShot, setEditingShot] = useState<Shot | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [creativeBrief, setCreativeBrief] = useState(() => projectBriefText(project?.brief));
  const [provider, setProvider] = useState<ScriptProvider>('claude');
  useEffect(() => {
    if (!project?.brief) return;
    setCreativeBrief((current) => current.trim() ? current : projectBriefText(project.brief));
    const briefProvider = project.brief.script_provider;
    if (briefProvider === 'claude' || briefProvider === 'openai' || briefProvider === 'deepseek') setProvider(briefProvider);
  }, [project?.brief, project?.id]);

  const [mockShots, setMockShots] = useState<Shot[]>(() => sampleShots.map((shot) => ({ ...shot, tags: shot.tags ? [...shot.tags] : [] })));
  const documentQuery = useQuery({ queryKey: ['script-document', projectId], queryFn: () => fetchScriptDocument(projectId), enabled: Boolean(projectId && project && !isMockProject) });

  const overviewQuery = useQuery({
    queryKey: ['shot-list-overview', project?.id],
    queryFn: () => fetchShotList(project!.id),
    enabled: Boolean(project && !isMockProject),
  });

  useEffect(() => {
    const episodes = overviewQuery.data?.episodes || [];
    if (!episodes.length) return;
    setActiveEpisode((current) => current && episodes.some((item) => item.episode === current) ? current : episodes[episodes.length - 1].episode);
  }, [overviewQuery.data?.episodes]);

  const shotListQuery = useQuery({
    queryKey: ['shot-list', project?.id, activeEpisode],
    queryFn: () => fetchShotList(project!.id, activeEpisode),
    enabled: Boolean(project && !isMockProject && activeEpisode),
  });

  const updateMutation = useMutation({
    mutationFn: updateStoryboardShot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shot-list', project?.id] });
      queryClient.invalidateQueries({ queryKey: ['shot-list-overview', project?.id] });
    },
  });

  const generateMutation = useMutation({
    mutationFn: () => generateShotList({ project_id: project!.id, creative_brief: creativeBrief.trim(), provider }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shot-list', project?.id] });
      queryClient.invalidateQueries({ queryKey: ['shot-list-overview', project?.id] });
      setConfirmReplace(false);
      setIsGenerateModalOpen(false);
    },
  });

  const convertMutation = useMutation({
    mutationFn: async () => {
      const document = documentQuery.data;
      if (!document) throw new Error('请先生成或保存剧本文本。');
      const base = {
        document_id: document.id,
        overwrite: true,
        converted_by: '新前端分镜工作台',
      };
      const preview = await convertScriptDocument(projectId, { ...base, dry_run: true });
      const downstreamTotal = Number(preview.downstream_assets?.total || 0);
      if (downstreamTotal > 0 && !window.confirm(`检测到 ${downstreamTotal} 项下游资产；转换会重建角色、场景和镜头。是否继续？`)) {
        throw new Error('已取消覆盖式剧本转换。');
      }
      return convertScriptDocument(projectId, {
        ...base,
        dry_run: false,
        allow_downstream_overwrite: downstreamTotal > 0,
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['shot-list', project?.id] }),
        queryClient.invalidateQueries({ queryKey: ['shot-list-overview', project?.id] }),
        queryClient.invalidateQueries({ queryKey: ['images', project?.id] }),
      ]);
    },
  });

  const episodeItems = useMemo<StoryboardEpisodeItem[]>(() => {
    if (isMockProject) return storyboardEpisodes.map((item, index) => ({ episode: index + 1, shotCount: index === 0 ? mockShots.length : 0, title: item.title }));
    return (overviewQuery.data?.episodes || []).map((item) => ({ episode: item.episode, shotCount: item.shot_count }));
  }, [isMockProject, mockShots.length, overviewQuery.data?.episodes]);

  const visibleShots = isMockProject ? mockShots : (shotListQuery.data?.shots || []).map(toStoryboardShot);
  const totalSeconds = visibleShots.reduce((sum, shot) => sum + (shot.durationSeconds ?? 0), 0);
  const currentEpisode = activeEpisode || episodeItems.at(-1)?.episode;
  const currentEpisodeItem = episodeItems.find((item) => item.episode === currentEpisode);
  const productionContext = overviewQuery.data;
  const activeSceneNames = (productionContext?.scenes || []).filter((scene) => visibleShots.some((shot) => shot.sceneNo === scene.scene_id)).map((scene) => scene.name || scene.scene_id);
  const error = projectQuery.error || documentQuery.error || overviewQuery.error || shotListQuery.error || updateMutation.error || generateMutation.error || convertMutation.error;
  const errorMessage = error instanceof Error ? error.message : '';

  const handleEditShot = (shot: Shot) => { setEditingShot(shot); setIsEditModalOpen(true); };
  const handleCloseModal = () => { setIsEditModalOpen(false); setEditingShot(null); };
  const handleSaveShot = (shot: Shot) => {
    if (isMockProject) {
      setMockShots((current) => current.map((item) => item.id === shot.id ? shot : item));
      handleCloseModal();
      return;
    }
    updateMutation.mutate(shot, { onSuccess: handleCloseModal });
  };

  if (!project) {
    return <div className="flex min-w-0 flex-1 flex-col"><StoryboardTopBar /><main className="flex flex-1 items-center justify-center p-8"><div className="space-y-3 text-center"><p className="text-[var(--text-secondary)]">请先在项目页选择一个项目，再进入分镜创作。</p><button type="button" onClick={() => navigate('/projects')} className="btn btn-primary btn-sm">前往项目</button></div></main></div>;
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <StoryboardTopBar title={project.name} subtitle="分镜创作 · STORYBOARD WORKSPACE" onGenerate={() => { setConfirmReplace(false); setIsGenerateModalOpen(true); }} isGenerating={generateMutation.isPending} />
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <ProcessStepBar />
        {isMockProject ? <p className="mb-4 rounded-xl border border-[var(--accent-primary)]/25 bg-[var(--accent-primary-bg)] px-4 py-3 text-sm text-[var(--text-secondary)]">LOCAL MOCK · 分镜编辑仅保存在当前浏览器会话中，不会请求或修改后端镜头数据。</p> : null}
        {!isMockProject ? <section className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--accent-primary)]/25 bg-[var(--accent-primary-bg)] px-4 py-3"><div><p className="text-sm font-semibold text-[var(--text-primary)]">优先沿用旧前端的“完整剧本 → 结构化分镜”转换链路</p><p className="mt-1 text-xs text-[var(--text-secondary)]">{documentQuery.data ? `已读取剧本 v${documentQuery.data.version}；转换会按旧版参数提交 document_id、overwrite、dry_run 和下游覆盖确认。` : '尚未读取到剧本文本；可先返回剧本创作生成或保存正文。'}</p></div><button type="button" onClick={() => convertMutation.mutate()} disabled={!documentQuery.data || convertMutation.isPending} className="btn btn-primary btn-sm disabled:cursor-not-allowed disabled:opacity-50">{convertMutation.isPending ? '转换中…' : '从剧本转为分镜'}</button></section> : null}
        {errorMessage ? <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{errorMessage}</p> : null}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3">
          <div><p className="text-xs font-semibold tracking-[0.12em] text-[var(--accent-primary)]">CURRENT EPISODE</p><div className="mt-1 flex items-center gap-2 text-sm text-[var(--text-secondary)]"><b className="text-[var(--text-primary)]">{currentEpisode ? '第 ' + currentEpisode + ' 集' : '尚未生成分镜'}</b>{currentEpisodeItem ? <span>· {currentEpisodeItem.shotCount} 镜 · {formatSeconds(totalSeconds)}</span> : null}</div>{!isMockProject && productionContext ? <p className="mt-1 text-xs text-[var(--text-muted)]">角色 {productionContext.characters.length} · 场景 {productionContext.scenes.length}{productionContext.rhythm_map ? ' · 节奏地图已载入' : ''}{activeSceneNames.length ? ' · 当前场景：' + activeSceneNames.join('、') : ''}</p> : null}</div>
          <div className="flex items-center gap-2">
            {!isMockProject && episodeItems.length ? <select value={currentEpisode || ''} onChange={(event) => setActiveEpisode(Number(event.target.value))} className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] lg:hidden">{episodeItems.map((item) => <option key={item.episode} value={item.episode}>第 {item.episode} 集</option>)}</select> : null}
            {!isMockProject ? <button type="button" onClick={() => { queryClient.invalidateQueries({ queryKey: ['shot-list', project.id] }); queryClient.invalidateQueries({ queryKey: ['shot-list-overview', project.id] }); }} className="btn btn-secondary btn-sm" aria-label="刷新分镜数据"><RefreshCw size={14} />刷新</button> : null}
          </div>
        </div>
        <div className="flex gap-6">
        {visibleShots.length ? <div className="mb-5 flex justify-end"><button type="button" onClick={() => navigate(workflowPath(projectId, 'image'))} className="btn btn-primary btn-sm">??????<ArrowRight size={14} /></button></div> : null}

          <StoryboardSidebar episodes={episodeItems} activeEpisode={currentEpisode} onEpisodeChange={setActiveEpisode} />
          <section className="min-w-0 flex-1">
            {(!isMockProject && (overviewQuery.isLoading || (activeEpisode && shotListQuery.isLoading))) ? <div className="glass-panel p-6 text-sm text-[var(--text-secondary)]">正在从后端读取分镜详情…</div> : visibleShots.length ? <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">{visibleShots.map((shot) => <ShotCard key={shot.id} shot={shot} onEdit={handleEditShot} />)}</div> : <EmptyStoryboard onCreate={() => { setConfirmReplace(false); setIsGenerateModalOpen(true); }} />}
          </section>
        </div>
      </main>
      <ShotEditModal isOpen={isEditModalOpen} shot={editingShot} onClose={handleCloseModal} onSave={handleSaveShot} />
      <Modal isOpen={isGenerateModalOpen} onClose={() => !generateMutation.isPending && setIsGenerateModalOpen(false)} ariaLabel="生成分镜" panelClassName="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] shadow-2xl">
        <form onSubmit={(event) => { event.preventDefault(); if (creativeBrief.trim()) generateMutation.mutate(); }}>
          <div className="border-b border-[var(--border-subtle)] px-6 py-5"><p className="text-xs font-semibold tracking-[0.12em] text-[var(--accent-primary)]">GENERATE STORYBOARD</p><h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">按既有剧本生成结构化分镜</h2><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">将调用 <code>/api/script/generate</code>，提交项目 ID、创作简述和模型 Provider；生成结果会落库并刷新当前分集列表。</p><p className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs leading-5 text-amber-200">注意：现有后端的导入逻辑会替换该项目已有的镜头、角色、场景和节奏地图。确认后再执行生成。</p></div>
          <div className="space-y-4 p-6"><label className="block text-sm font-medium text-[var(--text-primary)]">创作简述<textarea required value={creativeBrief} onChange={(event) => setCreativeBrief(event.target.value)} rows={8} placeholder="粘贴或补充分镜生成所依据的剧情、角色、场景和节奏要求。" className="mt-2 w-full resize-y rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] px-4 py-3 text-sm leading-6 text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]" /></label><label className="block text-sm font-medium text-[var(--text-primary)]">生成模型<select value={provider} onChange={(event) => setProvider(event.target.value as ScriptProvider)} className="mt-2 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"><option value="claude">Claude</option><option value="openai">OpenAI</option><option value="deepseek">DeepSeek</option></select></label><label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-[var(--text-secondary)]"><input type="checkbox" checked={confirmReplace} onChange={(event) => setConfirmReplace(event.target.checked)} className="mt-0.5 accent-[var(--accent-primary)]" /><span>我已知悉：本次生成会以新的结构化结果替换该项目现有的分镜、角色、场景和节奏数据。</span></label></div>
          <div className="flex justify-end gap-3 border-t border-[var(--border-subtle)] px-6 py-4"><button type="button" disabled={generateMutation.isPending} onClick={() => setIsGenerateModalOpen(false)} className="btn btn-secondary btn-sm">取消</button><button type="submit" disabled={generateMutation.isPending || !creativeBrief.trim() || !confirmReplace} className="btn btn-primary btn-sm disabled:cursor-not-allowed disabled:opacity-55">{generateMutation.isPending ? '正在生成…' : '开始生成'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
