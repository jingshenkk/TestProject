import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { FolderOpen, ArrowLeft } from 'lucide-react';
import VideoTopBar from '@/components/VideoTopBar';
import ProcessStepBar from '@/components/ProcessStepBar';
import CreationInput, { type CreationInputOptions } from '@/components/CreationInput';
import ScriptSettings from '@/components/ScriptSettings';
import EpisodeList from '@/components/EpisodeList';
import { generateShotList } from '@/api/script';
import type { Project } from '@/types/project';
import { getSelectedProject, setSelectedProject } from '@/stores/selectedProject';

function resolveProvider(modelKey: string): 'claude' | 'openai' | 'deepseek' {
  return modelKey === 'openai' || modelKey === 'deepseek' ? modelKey : 'claude';
}

export default function VideoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mockNotice, setMockNotice] = useState('');
  const intentProject = (location.state as { project?: Project } | null)?.project ?? null;
  const project = intentProject ?? getSelectedProject();
  if (intentProject) setSelectedProject(intentProject);
  const isMockProject = Boolean(project?.isMock);

  const generateMutation = useMutation({
    mutationFn: ({ options, prompt }: { options: CreationInputOptions; prompt: string }) => {
      if (!project) throw new Error('请先选择项目。');
      if (!prompt.trim()) throw new Error('请先填写创作描述。');
      return generateShotList({ project_id: project.id, creative_brief: prompt.trim(), provider: resolveProvider(options.modelKey) });
    },
    onSuccess: () => navigate('/storyboard'),
  });
  const errorMessage = generateMutation.error instanceof Error ? generateMutation.error.message : '';

  if (!project) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        <VideoTopBar title="视频创作" progress={0} subtitle="未选择项目" />
        <main className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div className="empty-frame flex flex-col items-center justify-center gap-5 text-center max-w-md w-full px-6 py-16 rounded-2xl relative overflow-hidden animate-fade-in">
            <div className="relative w-16 h-16 rounded-2xl bg-[var(--accent-primary-bg)] flex items-center justify-center"><FolderOpen size={28} className="text-[var(--accent-primary)]" /></div>
            <div className="relative space-y-1.5"><h2 className="text-lg font-semibold text-[var(--text-primary)]">暂未选择任何项目进行创作</h2><p className="text-sm text-[var(--text-secondary)] leading-relaxed">前往项目模块选择一个已有项目，或创建新项目后即可开始视频创作。</p></div>
            <button onClick={() => navigate('/projects')} className="relative btn btn-ghost btn-sm flex items-center gap-1.5"><ArrowLeft size={14} />前往项目</button>
          </div>
        </main>
      </div>
    );
  }

  const creationOptions: CreationInputOptions = {
    type: project.contentType || 'AI短剧', typeKey: project.contentType || 'ai_short_drama',
    style: project.visualStyle || '电影感写实', styleKey: 'cinematic_realism',
    format: `${project.aspectRatio} · ${project.episodeCount}集 · ${project.episodeDurationSec}s`,
    aspectRatio: project.aspectRatio || '9:16', episodeCount: project.episodeCount || 12, duration: project.episodeDurationSec || 120,
    model: 'Claude', modelKey: 'claude',
  };

  const handleGenerate = (options: CreationInputOptions, prompt: string) => {
    if (isMockProject) {
      setMockNotice(prompt.trim() ? '已在本地示例工作台记录本次创作描述；Mock 项目不会调用后端生成或写入业务台账。' : '请输入创作描述后即可体验本地示例工作台的交互。');
      return;
    }
    generateMutation.mutate({ options, prompt });
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <VideoTopBar title={project.name} progress={isMockProject ? 28 : 14} subtitle={isMockProject ? '本地示例创作' : '剧本与分镜生成'} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <ProcessStepBar />
        {isMockProject && <div className="mb-4 rounded-xl border border-[var(--accent-primary)]/25 bg-[var(--accent-primary-bg)] p-4 text-sm text-[var(--text-secondary)]"><p className="font-semibold text-[var(--accent-primary)]">LOCAL MOCK · 本地样例创作界面</p><p className="mt-1">你正在查看“{project.name}”的可交互前端样例。剧本设定、分集目录和媒体预览都可浏览；生成按钮只更新本地提示，不会调用生产接口。</p></div>}
        {errorMessage && <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{errorMessage}</p>}
        <CreationInput options={creationOptions} onGenerate={handleGenerate} isGenerating={!isMockProject && generateMutation.isPending} />
        {isMockProject ? (
          <>
            {mockNotice && <p className="mb-4 rounded-lg border border-[var(--color-success)]/25 bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--color-success)]">{mockNotice}</p>}
            <ScriptSettings />
            <EpisodeList />
          </>
        ) : (
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 text-sm text-[var(--text-secondary)]"><p className="font-medium text-[var(--text-primary)] mb-1">生成方式</p><p>提交创作描述后，系统会调用真实的剧本分镜生成接口并写入项目镜头表；完成后自动进入分镜工作台继续编辑。</p></div>
        )}
      </main>
    </div>
  );
}
