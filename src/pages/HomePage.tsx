import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, FileText, UsersRound } from 'lucide-react';
import TopBar from '@/components/TopBar';
import CreationInput, { type CreationInputOptions } from '@/components/CreationInput';
import RecentProjects from '@/components/RecentProjects';
import ReferenceVideos from '@/components/ReferenceVideos';
import { createProject, updateProject } from '@/api/projects';
import { fetchScriptProviders, generateScriptSetup, type ScriptProvider } from '@/api/script';
import { setSelectedProject } from '@/stores/selectedProject';

function resolveProvider(modelKey: string): ScriptProvider {
  if (modelKey === 'deepseek') return 'deepseek';
  if (modelKey === 'openai' || modelKey.startsWith('gpt')) return 'openai';
  return 'claude';
}

function initialProjectName(prompt: string): string {
  const compact = prompt.replace(/\s+/g, ' ').trim();
  if (!compact) return '未命名 AI 剧本';
  return compact.length > 28 ? compact.slice(0, 28) + '…' : compact;
}

export default function HomePage() {
  const navigate = useNavigate();
  const providersQuery = useQuery({
    queryKey: ['script-providers'],
    queryFn: fetchScriptProviders,
    staleTime: 60_000,
    retry: false,
  });
  const generateMutation = useMutation({
    mutationFn: async ({ options, prompt }: { options: CreationInputOptions; prompt: string }) => {
      const creativeBrief = prompt.trim();
      if (!creativeBrief) throw new Error('请先填写创作描述。');
      const provider = resolveProvider(options.modelKey);
      const project = await createProject({
        name: initialProjectName(creativeBrief),
        content_type: options.typeKey,
        aspect_ratio: options.aspectRatio,
        visual_style: options.style,
        episode_count: options.episodeCount,
        episode_duration_sec: options.duration,
        brief: {
          source: 'new_frontend_home',
          creative_brief: creativeBrief,
          script_provider: provider,
        },
      });
      const setupResult = await generateScriptSetup({
        project_id: project.id,
        creative_brief: creativeBrief,
        provider,
      });
      const namedProject = setupResult.setup.title && setupResult.setup.title !== project.name
        ? await updateProject(project.id, { name: setupResult.setup.title })
        : project;
      return { project: namedProject };
    },
    onSuccess: ({ project }) => {
      setSelectedProject(project);
      navigate('/video', { state: { project, showScriptWorkspace: true } });
    },
  });
  const errorMessage = generateMutation.error instanceof Error ? generateMutation.error.message : '';

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <TopBar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <section className="mb-5 lg:mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-primary)]">Creative Blueprint</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">先确定全剧蓝图，再进入可控生产</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">输入创意后，系统只生成可审核的全剧方案；确认角色、故事和分集节奏后，再试写并以队列方式生产分集剧本。</p>
        </section>

        <CreationInput
          onGenerate={(options, prompt) => generateMutation.mutate({ options, prompt })}
          isGenerating={generateMutation.isPending}
          generateLabel="生成全剧创作方案"
          generateHint="先生成全剧蓝图，确认后再开始试写与批量生产。"
          providerStatuses={providersQuery.data}
        />

        {generateMutation.isPending && (
          <section className="mb-6 rounded-xl border border-[var(--accent-primary)]/25 bg-[var(--accent-primary-bg)] px-4 py-4 text-sm text-[var(--text-secondary)]">
            <div className="flex items-center gap-2 font-medium text-[var(--text-primary)]"><FileText size={16} className="text-[var(--accent-primary)]" />正在生成全剧创作蓝图</div>
            <p className="mt-1.5 leading-6">本次仅生成剧名、故事梗概、角色设定、风格基调和分集计划；不会在首页直接生产全部剧本正文。</p>
          </section>
        )}
        {errorMessage && (
          <p className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{errorMessage}</p>
        )}

        <section className="grid grid-cols-1 gap-3 mb-7 md:grid-cols-3">
          {[
            { icon: FileText, title: '01 生成全剧蓝图', text: '剧名、梗概、叙事基调与分集大纲先形成可审核方案。' },
            { icon: UsersRound, title: '02 人工确认设定', text: '确认角色关系、人物弧光与每集钩子后，才进入正文生产。' },
            { icon: CheckCircle2, title: '03 试写后队列生产', text: '先试写第 1 集或前 3 集，质量确认后再分批生产全剧。' },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
              <Icon size={18} className="text-[var(--accent-primary)]" />
              <h2 className="mt-3 text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
              <p className="mt-1.5 text-xs leading-5 text-[var(--text-secondary)]">{text}</p>
            </article>
          ))}
        </section>

        <RecentProjects />
        <ReferenceVideos />
      </main>
    </div>
  );
}
