import { useMemo, useState } from 'react';
import { Play, Film, Eye, Clock } from 'lucide-react';
import { showcaseCategories, showcaseMedia } from '@/mocks/showcaseMedia';

export default function ReferenceVideos() {
  const [activeCategory, setActiveCategory] = useState<(typeof showcaseCategories)[number]>('全部');
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const media = useMemo(
    () => activeCategory === '全部' ? showcaseMedia : showcaseMedia.filter((item) => item.category === activeCategory),
    [activeCategory],
  );

  return (
    <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-tertiary)]/10 flex items-center justify-center"><Film size={16} className="text-[var(--accent-tertiary)]" /></div>
          <h2 className="text-base lg:text-lg font-semibold text-[var(--text-primary)]">参考视频与画面素材</h2>
        </div>
      </div>
      <div className="flex items-center gap-1 lg:gap-2 mb-5 lg:mb-6 p-1 bg-[var(--bg-surface)] rounded-xl w-fit">
        {showcaseCategories.map((category) => <button key={category} onClick={() => setActiveCategory(category)} className={`px-3 lg:px-4 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all duration-300 whitespace-nowrap ${activeCategory === category ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/25' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'}`}>{category}</button>)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
        {media.map((item, index) => (
          <div key={item.id} className="glass-card aspect-video relative overflow-hidden cursor-pointer group" style={{ animationDelay: `${0.25 + index * 0.05}s` }} onMouseEnter={() => setHoveredVideo(item.id)} onMouseLeave={() => setHoveredVideo(null)}>
            {item.kind === 'video' ? <video src={item.src} poster={item.poster} muted loop autoPlay playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" /> : <img src={item.src} alt={item.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3">
              <p className="text-xs lg:text-sm text-white font-medium truncate">{item.title}</p>
              <div className="mt-1 flex items-center gap-3 text-[10px] text-white/80"><span className="flex items-center gap-1"><Eye size={10} />{item.views}</span><span className="flex items-center gap-1"><Clock size={10} />{item.duration}</span></div>
            </div>
            {hoveredVideo === item.id && <div className="absolute inset-0 bg-[var(--accent-primary)]/25 flex items-center justify-center"><span className="w-12 h-12 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-lg"><Play size={20} className="ml-1 fill-white" /></span></div>}
          </div>
        ))}
      </div>
    </section>
  );
}
