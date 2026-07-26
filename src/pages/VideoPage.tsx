import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { FolderOpen, ArrowLeft } from 'lucide-react';
import VideoTopBar from '@/components/VideoTopBar';
import ProcessStepBar from '@/components/ProcessStepBar';
import CreationInput, { type CreationInputOptions } from '@/components/CreationInput';
import { generateShotList } from '@/api/script';
import type { Project } from '@/types/project';
import { getSelectedProject, setSelectedProject } from '@/stores/selectedProject';

function resolveProvider(modelKey: string): 'claude' | 'openai' | 'deepseek' {
  return modelKey === 'openai' || modelKey === 'deepseek' ? modelKey : 'claude';
}

export default function VideoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const intentProject = (location.state as { project?: Project } | null)?.project ?? null;
  const project = intentProject ?? getSelectedProject();
  if (intentProject) setSelectedProject(intentProject);

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

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <VideoTopBar title={project.name} progress={14} subtitle="剧本与分镜生成" />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <ProcessStepBar />
        {errorMessage && <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{errorMessage}</p>}
        <CreationInput
          options={{
            type: project.contentType || 'AI短剧', typeKey: project.contentType || 'ai_short_drama',
            style: project.visualStyle || '电影感写实', styleKey: 'cinematic_realism',
            format: `${project.aspectRatio} · ${project.episodeCount}集 · ${project.episodeDurationSec}s`,
            aspectRatio: project.aspectRatio || '9:16', episodeCount: project.episodeCount || 12, duration: project.episodeDurationSec || 120,
            model: 'Claude', modelKey: 'claude',
          }}
          onGenerate={(options, prompt) => generateMutation.mutate({ options, prompt })}
          isGenerating={generateMutation.isPending}
        />
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 text-sm text-[var(--text-secondary)]">
          <p className="font-medium text-[var(--text-primary)] mb-1">生成方式</p>
          <p>提交创作描述后，系统会调用真实的剧本分镜生成接口并写入项目镜头表；完成后自动进入分镜工作台继续编辑。</p>
        </div>
      </main>
    </div>
  );
}
