import { useEffect, useMemo, useState } from 'react';
import type { ScriptSetup } from '@/api/script';

interface ScriptSettingsProps {
  setup: ScriptSetup;
  isSaving?: boolean;
  onSave?: (setup: ScriptSetup) => void;
}

function cloneSetup(setup: ScriptSetup): ScriptSetup {
  return {
    ...setup,
    characters: setup.characters.map((character) => ({ ...character })),
    episodes: setup.episodes.map((episode) => ({ ...episode })),
  };
}

export default function ScriptSettings({ setup, isSaving = false, onSave }: ScriptSettingsProps) {
  const [activeTab, setActiveTab] = useState<'intro' | 'characters'>('intro');
  const [draft, setDraft] = useState<ScriptSetup>(() => cloneSetup(setup));

  useEffect(() => {
    setDraft(cloneSetup(setup));
  }, [setup]);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(setup),
    [draft, setup],
  );

  const updateField = (field: keyof Pick<ScriptSetup, 'title' | 'logline' | 'synopsis' | 'genre' | 'style_type' | 'tone'>, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const updateCharacter = (index: number, field: keyof ScriptSetup['characters'][number], value: string) => {
    setDraft((current) => ({
      ...current,
      characters: current.characters.map((character, characterIndex) => (
        characterIndex === index ? { ...character, [field]: value } : character
      )),
    }));
  };

  return (
    <section className="glass-panel p-4 lg:p-6 mb-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between mb-5">
        <div>
          <h2 className="text-base lg:text-lg font-medium text-[var(--text-primary)]">剧本大纲</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">剧本简介、角色设定与风格类型会作为后续逐集剧本生成的唯一设定来源。</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <span className="text-xs text-[var(--text-muted)]">变更剧本设定内容，提交后已生成的剧本将清空，请谨慎操作！</span>
          <button
            type="button"
            disabled={!isDirty || isSaving || !onSave}
            onClick={() => onSave?.(draft)}
            className="h-8 shrink-0 px-4 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary-dim)] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            {isSaving ? '保存中…' : '保存设定'}
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-4 border-b border-[var(--border-subtle)]">
        <button type="button" onClick={() => setActiveTab('intro')} className={'pb-2 text-sm font-medium transition-colors ' + (activeTab === 'intro' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]')}>剧本简介</button>
        <button type="button" onClick={() => setActiveTab('characters')} className={'pb-2 text-sm font-medium transition-colors ' + (activeTab === 'characters' ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]')}>角色设定</button>
      </div>

      {activeTab === 'intro' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <label className="space-y-1.5"><span className="text-xs text-[var(--text-muted)]">剧本标题</span><input value={draft.title} onChange={(event) => updateField('title', event.target.value)} className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]" /></label>
          <label className="space-y-1.5"><span className="text-xs text-[var(--text-muted)]">类型 / 风格类型</span><div className="grid grid-cols-2 gap-2"><input value={draft.genre} onChange={(event) => updateField('genre', event.target.value)} placeholder="类型" className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]" /><input value={draft.style_type} onChange={(event) => updateField('style_type', event.target.value)} placeholder="风格类型" className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]" /></div></label>
          <label className="space-y-1.5 lg:col-span-2"><span className="text-xs text-[var(--text-muted)]">一句话梗概</span><input value={draft.logline} onChange={(event) => updateField('logline', event.target.value)} className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]" /></label>
          <label className="space-y-1.5 lg:col-span-2"><span className="text-xs text-[var(--text-muted)]">剧本简介</span><textarea value={draft.synopsis} onChange={(event) => updateField('synopsis', event.target.value)} rows={7} className="w-full resize-y rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-3 py-2 text-sm leading-6 text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]" /></label>
        </div>
      ) : (
        <div className="space-y-4">
          {draft.characters.map((character, index) => (
            <article key={index} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3"><label className="space-y-1"><span className="text-xs text-[var(--text-muted)]">角色名称</span><input value={character.name} onChange={(event) => updateCharacter(index, 'name', event.target.value)} className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]" /></label><label className="space-y-1"><span className="text-xs text-[var(--text-muted)]">角色类型</span><input value={character.role} onChange={(event) => updateCharacter(index, 'role', event.target.value)} className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]" /></label></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3"><label className="space-y-1"><span className="text-xs text-[var(--text-muted)]">身份背景</span><textarea rows={3} value={character.description} onChange={(event) => updateCharacter(index, 'description', event.target.value)} className="w-full resize-y rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-3 py-2 text-sm leading-6 text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]" /></label><label className="space-y-1"><span className="text-xs text-[var(--text-muted)]">性格与成长弧线</span><textarea rows={3} value={character.personality + '\n' + character.arc} onChange={(event) => { const [personality, ...arc] = event.target.value.split('\n'); updateCharacter(index, 'personality', personality); updateCharacter(index, 'arc', arc.join('\n')); }} className="w-full resize-y rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-3 py-2 text-sm leading-6 text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]" /></label></div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
