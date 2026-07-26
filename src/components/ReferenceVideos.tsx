import { useState } from 'react';
import { categories, videos } from '@/mocks/referenceVideos';
import { Play, Film, Eye, Clock } from 'lucide-react';

export default function ReferenceVideos() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [_hoveredVideo, setHoveredVideo] = useState<number | null>(null);

  return (
    <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-tertiary)]/10 flex items-center justify-center">
            <Film size={16} className="text-[var(--accent-tertiary)]" />
          </div>
          <h2 className="text-base lg:text-lg font-semibold text-[var(--text-primary)]">参考视频</h2>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 lg:gap-2 mb-5 lg:mb-6 p-1 bg-[var(--bg-surface)] rounded-xl w-fit">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              px-3 lg:px-4 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all duration-300 whitespace-nowrap
              ${activeCategory === cat
                ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/25'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="glass-card aspect-video relative overflow-hidden cursor-pointer group"
            style={{ animationDelay: `${0.25 + index * 0.05}s` }}
            onMouseEnter={() => setHoveredVideo(video.id)}
            onMouseLeave={() => setHoveredVideo(null)}
          >
            {/* 背景渐变 */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-input)] via-[var(--bg-surface)] to-[var(--bg-input)]" />

            {/* Cross Lines Pattern - 电影取景框风格 */}
            <div className="absolute inset-0 flex items-center justify-center opacity-60">
              {/* Horizontal line */}
              <div className="absolute w-full h-[1px] bg-[var(--border-default)]" />
              {/* Vertical line */}
              <div className="absolute h-full w-[1px] bg-[var(--border-default)]" />
              {/* Diagonal lines */}
              <div className="absolute w-[141%] h-[1px] bg-[var(--border-default)] rotate-45" />
              <div className="absolute w-[141%] h-[1px] bg-[var(--border-default)] -rotate-45" />
              {/* 取景框四角 */}
              <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[var(--accent-primary)]/40" />
              <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[var(--accent-primary)]/40" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[var(--accent-primary)]/40" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[var(--accent-primary)]/40" />
            </div>

            {/* Center Label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs lg:text-sm text-[var(--text-muted)] bg-[var(--bg-card)]/90 backdrop-blur px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] group-hover:border-[var(--accent-primary)]/30 transition-all duration-300">
                {video.title}
              </span>
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--accent-primary)]/30 via-[var(--accent-primary-bg)] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <span className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary-dim)] text-white flex items-center justify-center shadow-lg shadow-[var(--accent-primary)]/40">
                  <Play size={20} className="ml-1 fill-white" />
                </span>
                <span className="text-white text-xs font-medium">点击播放</span>
              </div>
            </div>

            {/* 底部信息条 */}
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center gap-3 text-[10px] text-white/80">
                <span className="flex items-center gap-1">
                  <Eye size={10} />
                  1.2k
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  03:45
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
