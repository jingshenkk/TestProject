import { NavLink, useParams } from 'react-router-dom';
import { Home, Video, Wrench, Image as ImageIcon, Folder, Box } from 'lucide-react';
import { workflowPath } from '@/lib/projectWorkflow';
import { getSelectedProject } from '@/stores/selectedProject';

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const menuItems: MenuItem[] = [
  { key: 'home', label: '首页', icon: <Home size={18} />, path: '/' },
  { key: 'video', label: '视频', icon: <Video size={18} />, path: '/video' },
  { key: 'tools', label: '工具', icon: <Wrench size={18} />, path: '/tools' },
  { key: 'space', label: '空间', icon: <Box size={18} />, path: '/space' },
  { key: 'assets', label: '素材', icon: <ImageIcon size={18} />, path: '/assets' },
  { key: 'projects', label: '项目', icon: <Folder size={18} />, path: '/projects' },
];

export default function Sidebar() {
  const { projectId: projectIdParam } = useParams<{ projectId?: string }>();
  const projectId = Number(projectIdParam) || getSelectedProject()?.id || 0;
  const workflowItems = menuItems.map((item) => item.key === 'video'
    ? { ...item, path: workflowPath(projectId, 'script') }
    : item);
  return (
    <aside className="w-[100px] lg:w-[120px] min-h-screen bg-[var(--chrome-sidebar)] border-r border-[var(--border-subtle)] flex flex-col items-center py-6 gap-1.5 animate-slide-in flex-shrink-0 relative overflow-hidden">
      {/* 背景辉光效果 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(59,164,255,0.08) 0%, transparent 50%)',
          animation: 'sidebar-breathe 4s ease-in-out infinite'
        }}
      />

      {/* Logo 区域 */}
      <div className="relative mb-6 w-[60px] h-[60px] lg:w-[72px] lg:h-[72px] rounded-2xl flex items-center justify-center overflow-hidden group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 border border-[var(--border-subtle)] rounded-2xl group-hover:border-[var(--accent-primary)]/50 transition-colors duration-300" />
        <span className="text-xl lg:text-2xl font-bold text-[var(--accent-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
          AV
        </span>
      </div>

      {/* 分隔线 */}
      <div className="w-[60px] lg:w-[80px] h-px bg-gradient-to-r from-transparent via-[var(--border-default)] to-transparent mb-3" />

      {workflowItems.map((item, index) => (
        <NavLink
          key={item.key}
          to={item.path}
          className={({ isActive }) => `
            focus-ring group relative w-[84px] lg:w-[100px] py-3 rounded-xl flex flex-col items-center gap-1.5
            transition-all duration-300 ease-out no-underline
            ${isActive
              ? 'bg-[var(--accent-primary)] text-white shadow-[0_8px_28px_-6px_rgba(59,164,255,0.55)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }
          `}
          style={{ animationDelay: `${index * 0.05}s` }}
          title={item.label}
        >
          {/* 激活指示器 */}
          <span className={`
            absolute left-0 w-1 h-6 rounded-r-full bg-[var(--accent-primary)]
            transition-all duration-300 ease-out
            ${({ isActive }: { isActive: boolean }) => isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
          `} />

          {/* 图标容器 */}
          <span className="relative transition-all duration-300 ease-out group-hover:scale-110 group-active:scale-95">
            {item.icon}
            {/* 悬停辉光 */}
            <span className="absolute inset-0 bg-[var(--accent-primary)] rounded-full blur-md opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </span>

          <span className="text-xs font-medium tracking-wide">{item.label}</span>

          {/* 微光效果 - 仅非激活态 */}
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
          </span>
        </NavLink>
      ))}

      {/* 底部装饰 */}
      <div className="mt-auto pt-6 flex flex-col items-center gap-3">
        <div className="w-[60px] lg:w-[80px] h-px bg-gradient-to-r from-transparent via-[var(--border-default)] to-transparent" />
        <span className="text-[10px] text-[var(--text-muted)] opacity-50">
          ANT VISION
        </span>
      </div>
    </aside>
  );
}
