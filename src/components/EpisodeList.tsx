import { useEffect, useMemo, useState } from 'react';
import type { EpisodeWorkspaceItem } from '@/api/script';

interface EpisodeListProps {
  episodes: EpisodeWorkspaceItem[];
  isSaving?: boolean;
  onSaveEpisode?: (episode: number, content: string) => void;
}

export default function EpisodeList({ episodes, isSaving = false, onSaveEpisode }: EpisodeListProps) {
  const [activeEpisode, setActiveEpisode] = useState(episodes[0]?.episode || 1);
  const selected = episodes.find((episode) => episode.episode === activeEpisode) || episodes[0];
  const [draftContent, setDraftContent] = useState(selected?.content || '');

  useEffect(() => {
    if (!episodes.some((episode) => episode.episode === activeEpisode)) setActiveEpisode(episodes[0]?.episode || 1);
  }, [activeEpisode, episodes]);

  useEffect(() => {
    setDraftContent(selected?.content || '');
  }, [selected?.episode, selected?.content]);

  const generatedCount = useMemo(() => episodes.filter((episode) => episode.status === 'generated').length, [episodes]);
  const isDirty = draftContent !== (selected?.content || '');

  if (!selected) return null;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4 lg:gap-6">
      <aside className="glass-panel p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-[var(--text-primary)]">目录</h3>
          <span className="text-xs text-[var(--text-muted)]">{generatedCount}/{episodes.length} 集已生成</span>
        </div>
        <div className="space-y-2">
          {episodes.map((episode) => (
            <button key={episode.episode} type="button" onClick={() => setActiveEpisode(episode.episode)} className={'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all duration-200 ' + (activeEpisode === episode.episode ? 'bg-[var(--bg-elevated)] border border-[var(--border-default)]' : 'hover:bg-[var(--bg-surface)]')}>
              <div className={'w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ' + (episode.status === 'generated' ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--bg-input)] text-[var(--text-muted)]')}>
                {episode.episode}
              </div>
              <span className="min-w-0 text-sm text-[var(--text-primary)] truncate">第{episode.episode}集：{episode.status === 'generated' ? episode.title : '待生成'}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className="space-y-4 min-w-0">
        <article className="glass-panel p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><h3 className="text-base font-medium text-[var(--text-primary)]">第{selected.episode}集：{selected.title}</h3><span className={'text-xs ' + (selected.status === 'generated' ? 'text-[var(--color-success)]' : 'text-[var(--text-muted)]')}>{selected.status === 'generated' ? '已生成' : '待生成'}</span></div>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{selected.summary}</p>
        </article>

        <article className="glass-panel p-4">
          <div className="flex items-center justify-between gap-3 mb-3"><h4 className="text-sm font-medium text-[var(--accent-primary)]">第{selected.episode}集剧本正文</h4><button type="button" disabled={!isDirty || isSaving || !onSaveEpisode} onClick={() => onSaveEpisode?.(selected.episode, draftContent)} className="btn btn-primary btn-sm disabled:cursor-not-allowed disabled:opacity-50">{isSaving ? '保存中…' : '保存本集'}</button></div>
          <textarea value={draftContent} onChange={(event) => setDraftContent(event.target.value)} placeholder="本集剧本生成后会显示在这里，也可以直接手动编辑。" rows={18} className="w-full resize-y rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-4 py-3 text-sm leading-7 text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]" />
        </article>
      </div>
    </section>
  );
}
