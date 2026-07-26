import { MoreHorizontal } from 'lucide-react';
import { recentProjects } from '@/mocks/recentProjects';

export default function RecentProjects() {
  return (
    <section className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base lg:text-lg font-medium text-[var(--text-primary)]">最近个人项目</h2>
        <button className="text-xs lg:text-sm text-[var(--accent-primary)] hover:underline">
          全部项目
        </button>
      </div>

      {/* Project Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4">
        {recentProjects.map((project) => (
          <div
            key={project.id}
            className="glass-card p-2 lg:p-3 cursor-pointer group"
          >
            {/* Cover Placeholder */}
            <div className="aspect-video rounded-lg bg-[var(--bg-input)] flex items-center justify-center mb-2 lg:mb-3 relative overflow-hidden">
              <span className="text-[10px] lg:text-xs text-[var(--text-muted)]">项目封面</span>
              <button className="absolute bottom-2 right-2 w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-[var(--bg-surface)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <MoreHorizontal size={12} className="lg:w-[14px] lg:h-[14px] text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* Title & Date */}
            <h3 className="text-xs lg:text-sm font-medium text-[var(--text-primary)] truncate mb-1">
              {project.title}
            </h3>
            <p className="text-[10px] lg:text-xs text-[var(--text-muted)]">{project.date}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
