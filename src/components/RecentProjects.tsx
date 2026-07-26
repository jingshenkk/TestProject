import { MoreHorizontal, Play, Clock, FolderOpen, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProjects } from '@/api/projects';
import { setSelectedProject } from '@/stores/selectedProject';
import type { Project } from '@/types/project';

/**
 * 首页「最近个人项目」
 * —— P-路由：与项目模块（ProjectsPage）保持同一数据源 sampleProjects，
 *     不再使用独立的 recentProjects mock，确保首页看到的最近项目与项目页一致。
 *     卡片点击 → 跳转视频模块并携带所点击的 project（由 VideoPage 读取 location.state 决定是否进入创作页）。
 *     「全部项目」按钮 → 路由到项目模块 /projects。
 */
export default function RecentProjects() {
  const navigate = useNavigate();
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });
  const projects = projectsQuery.data || [];

  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
    navigate('/video', { state: { project } });
  };

  const handleCardKeyDown = (e: React.KeyboardEvent, project: Project) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpenProject(project);
    }
  };

  return (
    <section className="mb-8 lg:mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary-bg)] flex items-center justify-center">
            <FolderOpen size={16} className="text-[var(--accent-primary)]" />
          </div>
          <h2 className="text-base lg:text-lg font-semibold text-[var(--text-primary)]">最近个人项目</h2>
        </div>
        <button
          onClick={() => navigate('/projects')}
          className="text-xs lg:text-sm text-[var(--accent-primary)] hover:text-[var(--accent-primary-dim)] font-medium flex items-center gap-1 transition-colors group"
        >
          全部项目
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </button>
      </div>

      {/* Project Cards - Responsive Grid */}
      {projectsQuery.isLoading ? <p className="text-sm text-[var(--text-secondary)]">正在加载最近项目...</p> : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4">
        {projects.map((project, index) => (
          <div
            key={project.id}
            role="button"
            tabIndex={0}
            onClick={() => handleOpenProject(project)}
            onKeyDown={(e) => handleCardKeyDown(e, project)}
            className="glass-card p-2.5 lg:p-3.5 cursor-pointer group relative overflow-hidden"
            style={{ animationDelay: `${0.15 + index * 0.05}s` }}
          >
            {/* 悬停边框辉光 */}
            <div className="absolute inset-0 rounded-xl border border-[var(--accent-primary)] opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none" />

            {/* Cover Placeholder · 胶片纹理 + 品牌 hover 播放态 */}
            <div className="empty-frame aspect-video rounded-xl bg-[var(--bg-input)] flex items-center justify-center mb-3 relative overflow-hidden">
              {/* 渐变背景 */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-input)] to-[var(--bg-surface)]" />

              {/* 十字构图参考线 */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute w-full h-[1px] bg-[var(--border-subtle)]" />
                <div className="absolute h-full w-[1px] bg-[var(--border-subtle)]" />
              </div>

              {/* 封面标签 */}
              <span className="relative z-10 text-[10px] lg:text-xs text-[var(--text-muted)] px-2 py-1 rounded bg-[var(--bg-card)]/80 backdrop-blur transition-all duration-300 group-hover:opacity-0 group-hover:scale-95 flex items-center gap-1">
                <Film size={10} className="opacity-70" />
                项目封面
              </span>

              {/* Hover 播放 affordance */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[var(--accent-primary)]/20 via-[var(--accent-primary-bg)] to-[var(--accent-primary-bg)] opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary-dim)] text-white flex items-center justify-center shadow-[0_8px_24px_-6px_rgba(59,164,255,0.6)] transform scale-75 group-hover:scale-100 transition-transform duration-300">
                  <Play size={18} className="lg:w-5 lg:h-5 ml-0.5 fill-white" />
                </span>
              </div>

              {/* 更多操作按钮 */}
              <button
                onClick={(e) => e.stopPropagation()}
                className="focus-ring absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--bg-card)]/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[var(--bg-surface)] hover:scale-110"
              >
                <MoreHorizontal size={14} className="text-[var(--text-secondary)]" />
              </button>

              {/* 底部信息条 */}
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Title & Date */}
            <h3 className="text-xs lg:text-sm font-medium text-[var(--text-primary)] truncate mb-1.5 group-hover:text-[var(--accent-primary)] transition-colors">
              {project.name}
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] lg:text-xs text-[var(--text-muted)]">
              <Clock size={10} className="opacity-70" />
              <span>{project.lastUpdated}</span>
            </div>
          </div>
        ))}
      </div>}
    </section>
  );
}