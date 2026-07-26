import { useState } from 'react';
import { episodes, episodeContent } from '@/mocks/episodes';

export default function EpisodeList() {
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [content] = useState(episodeContent);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 lg:gap-6">
      {/* Left - Episode List */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-[var(--text-primary)]">目录</h3>
          <span className="text-xs text-[var(--text-muted)]">5/10</span>
        </div>

        <div className="space-y-2">
          {episodes.map((ep) => (
            <button
              key={ep.id}
              onClick={() => setActiveEpisode(ep.id)}
              className={`
                w-full flex items-center gap-3 p-2 rounded-lg text-left
                transition-all duration-200
                ${activeEpisode === ep.id
                  ? 'bg-[var(--bg-elevated)] border border-[var(--border-default)]'
                  : 'hover:bg-[var(--bg-surface)]'
                }
              `}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  ep.status === 'completed'
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-input)] text-[var(--text-muted)]'
                }`}
              >
                {ep.id}
              </div>
              <span className="text-sm text-[var(--text-primary)]">
                第{ep.id}集：{ep.title || '待生成'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Right - Episode Content */}
      <div className="space-y-4">
        {/* Summary */}
        <div className="glass-panel p-4">
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">
            {content.title}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {content.summary}
          </p>
        </div>

        {/* Scenes */}
        {content.scenes.map((scene) => (
          <div key={scene.id} className="glass-panel p-4">
            <h4 className="text-sm font-medium text-[var(--accent-primary)] mb-3">
              {scene.location}
            </h4>
            <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
              {scene.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
