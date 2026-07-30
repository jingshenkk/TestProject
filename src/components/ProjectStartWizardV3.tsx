import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { LoaderCircle, Sparkles } from 'lucide-react';
import { createProjectFromCreativeBrief, fetchProjectRecipes } from '@/api/projects';
import { fetchScriptProviders, type ScriptProvider } from '@/api/script';
import type { Project } from '@/types/project';

interface Props { onCreated: (project: Project) => void; }
const providerLabels: Record<ScriptProvider, string> = { claude: 'DeepSeek V4 Pro', openai: 'GPT-5', deepseek: 'DeepSeek Chat' };

export default function ProjectStartWizardV3({ onCreated }: Props) {
  const recipesQuery = useQuery({ queryKey: ['project-recipes'], queryFn: fetchProjectRecipes, staleTime: 300_000 });
  const providersQuery = useQuery({ queryKey: ['script-providers'], queryFn: fetchScriptProviders, staleTime: 60_000, retry: false });
  const recipes = recipesQuery.data || [];
  const [creativeBrief, setCreativeBrief] = useState('');
  const [contentType, setContentType] = useState('');
  const [provider, setProvider] = useState<ScriptProvider>('claude');
  const recipe = useMemo(() => recipes.find((item) => item.key === contentType) || recipes[0], [contentType, recipes]);
  const configured = providersQuery.data?.filter((item) => item.configured).map((item) => item.key) || [];
  useEffect(() => { if (!contentType && recipes[0]) setContentType(recipes[0].key); }, [contentType, recipes]);

  const start = useMutation({
    mutationFn: () => createProjectFromCreativeBrief({ creative_brief: creativeBrief.trim(), content_type: recipe!.key, provider }),
    onSuccess: ({ project }) => onCreated(project),
  });
  const errorText = start.error instanceof Error ? start.error.message : recipesQuery.error instanceof Error ? recipesQuery.error.message : '';

  if (recipesQuery.isLoading) return <div className="glass-panel p-6 text-sm text-[var(--text-secondary)]">正在读取后端内容品类与 Brief 模板…</div>;
  return <section className="project-start-wizard w-full overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-xl shadow-black/10">
    <header className="border-b border-[var(--border-subtle)] px-5 py-5 sm:px-7"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-primary)]">Creative Project Start</p><h1 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">输入创意，立即生成项目</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">点击生成后，项目会立即写入后台台账；系统随后异步生成动态 Brief、生产规格、视觉与模型建议。你可以在剧本创作界面确认这些内容，再手动生成剧本。</p></header>
    <div className="p-5 sm:p-7">
      {errorText && <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">{errorText}</p>}
      <label className="block space-y-2"><span className="text-sm font-medium text-[var(--text-primary)]">创意描述</span><textarea value={creativeBrief} onChange={(event) => setCreativeBrief(event.target.value)} rows={8} placeholder="描述你想制作的内容、人物或产品、核心冲突、目标受众和交付目标。" className="w-full resize-y rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] px-4 py-3 text-sm leading-6 text-[var(--text-primary)]" /></label>
      <div className="mt-5 grid gap-4 md:grid-cols-2"><label className="space-y-2"><span className="text-sm font-medium text-[var(--text-primary)]">内容类型</span><select value={contentType} onChange={(event) => setContentType(event.target.value)} className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)]">{recipes.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select><p className="text-xs leading-5 text-[var(--text-muted)]">{recipe?.description}</p></label><label className="space-y-2"><span className="text-sm font-medium text-[var(--text-primary)]">剧本模型</span><select value={provider} onChange={(event) => setProvider(event.target.value as ScriptProvider)} className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)]">{(['claude', 'openai', 'deepseek'] as ScriptProvider[]).map((key) => <option key={key} value={key} disabled={Boolean(providersQuery.data?.length) && !configured.includes(key)}>{providerLabels[key]}{Boolean(providersQuery.data?.length) && !configured.includes(key) ? '（未配置）' : ''}</option>)}</select><p className="text-xs leading-5 text-[var(--text-muted)]">模型用于创建建议和后续剧本生成，均由人工确认后才进入下一步。</p></label></div>
      <div className="mt-6 flex justify-end"><button type="button" disabled={!creativeBrief.trim() || !recipe || start.isPending} onClick={() => start.mutate()} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50">{start.isPending ? <><LoaderCircle size={15} className="animate-spin" />正在创建项目…</> : <><Sparkles size={15} />生成项目</>}</button></div>
    </div>
  </section>;
}
