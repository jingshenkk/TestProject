import { Clapperboard } from 'lucide-react';

export interface StoryboardEpisodeItem {
  episode: number;
  shotCount: number;
  title?: string;
}

interface StoryboardSidebarProps {
  episodes: StoryboardEpisodeItem[];
  activeEpisode?: number;
  onEpisodeChange?: (episode: number) => void;
}

export default function StoryboardSidebar({ episodes, activeEpisode, onEpisodeChange }: StoryboardSidebarProps) {
  return (
    <aside className="hidden w-[228px] shrink-0 lg:block">
      <div className="glass-panel sticky top-24 p-3">
        <div className="mb-3 flex items-center justify-between px-1">
          <div><p className="text-xs font-semibold tracking-[0.12em] text-[var(--accent-primary)]">EPISODES</p><h2 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">分集列表</h2></div>
          <Clapperboard size={16} className="text-[var(--text-muted)]" />
        </div>
        <div className="space-y-1.5">
          {episodes.map((item) => {
            const selected = item.episode === activeEpisode;
            return <button key={item.episode} type="button" onClick={() => onEpisodeChange?.(item.episode)} className={'w-full rounded-xl border p-3 text-left transition-colors ' + (selected ? 'border-[var(--accent-primary)]/35 bg-[var(--accent-primary-bg)]' : 'border-transparent hover:bg-[var(--bg-surface)]')}>
              <div className="flex items-center justify-between gap-3"><span className={'font-mono text-xs font-semibold ' + (selected ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]')}>S{String(item.episode).padStart(2, '0')}</span><span className="text-xs text-[var(--text-muted)]">{item.shotCount} 镜</span></div>
              <p className="mt-1 truncate text-sm font-medium text-[var(--text-primary)]">{item.title || '第' + item.episode + '集'}</p>
            </button>;
          })}
          {!episodes.length ? <p className="px-2 py-4 text-xs leading-5 text-[var(--text-muted)]">尚未从后端读取到已生成的分镜集数。</p> : null}
        </div>
      </div>
    </aside>
  );
}
