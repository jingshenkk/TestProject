import { useState } from 'react';
import { Edit3, Maximize2 } from 'lucide-react';
import { storyboardEpisodes as episodes } from '@/mocks/storyboardEpisodes';

export default function StoryboardSidebar() {
  const [activeEpisode, setActiveEpisode] = useState('S03');
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`${isExpanded ? 'w-[200px]' : 'w-[60px]'} flex-shrink-0 transition-all duration-300`}>
      <div className="glass-panel h-full p-3 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {isExpanded && (
            <button className="p-1.5 rounded hover:bg-[var(--bg-surface)] text-[var(--text-muted)] transition-colors">
              <Edit3 size={14} />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded hover:bg-[var(--bg-surface)] text-[var(--text-muted)] transition-colors"
          >
            <Maximize2 size={14} className={`transition-transform duration-300 ${isExpanded ? '' : 'rotate-90'}`} />
          </button>
        </div>

        {/* Episode List */}
        <div className="space-y-2 flex-1">
          {episodes.map((ep) => (
            <button
              key={ep.id}
              onClick={() => setActiveEpisode(ep.id)}
              className={`
                w-full flex items-center gap-3 p-2 rounded-xl text-left
                transition-all duration-200 group
                ${activeEpisode === ep.id
                  ? 'bg-[var(--bg-elevated)] border border-[var(--border-default)]'
                  : 'hover:bg-[var(--bg-surface)]'
                }
              `}
            >
              {/* Episode Badge */}
              <div
                className={`
                  flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                  transition-all duration-200
                  ${activeEpisode === ep.id
                    ? 'bg-[var(--accent-primary)] text-white shadow-lg'
                    : 'bg-[var(--bg-input)] text-[var(--text-muted)] group-hover:bg-[var(--accent-primary)]/10 group-hover:text-[var(--accent-primary)]'
                  }
                `}
              >
                {ep.id}
              </div>

              {/* Episode Title */}
              {isExpanded && (
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-[var(--text-primary)] font-medium truncate">
                    {ep.title}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
