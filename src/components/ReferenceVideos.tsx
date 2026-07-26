import { useState } from 'react';
import { categories, videos } from '@/mocks/referenceVideos';

export default function ReferenceVideos() {
  const [activeCategory, setActiveCategory] = useState('全部');

  return (
    <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
      {/* Category Tabs */}
      <div className="flex items-center gap-2 lg:gap-4 mb-4 lg:mb-5 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              text-xs lg:text-sm font-medium transition-colors duration-200 whitespace-nowrap
              ${activeCategory === cat
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className="glass-card aspect-video relative overflow-hidden cursor-pointer group"
          >
            {/* Cross Lines Pattern */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Horizontal line */}
              <div className="absolute w-full h-[1px] bg-[var(--border-default)]" />
              {/* Vertical line */}
              <div className="absolute h-full w-[1px] bg-[var(--border-default)]" />
              {/* Diagonal lines */}
              <div className="absolute w-[141%] h-[1px] bg-[var(--border-default)] rotate-45" />
              <div className="absolute w-[141%] h-[1px] bg-[var(--border-default)] -rotate-45" />
            </div>

            {/* Center Label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs lg:text-sm text-[var(--text-muted)] bg-[var(--bg-card)] px-2 py-1 rounded">
                {video.title}
              </span>
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-[var(--accent-primary-bg)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white text-xs lg:text-sm font-medium">点击播放</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
