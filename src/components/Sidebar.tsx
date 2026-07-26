import { NavLink } from 'react-router-dom';
import { Home, Video, Wrench, Image as ImageIcon, Folder, Box } from 'lucide-react';

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
  return (
    <aside className="w-[100px] lg:w-[120px] min-h-screen bg-[var(--chrome-sidebar)] border-r border-[var(--border-subtle)] flex flex-col items-center py-6 gap-1 animate-slide-in flex-shrink-0">
      {menuItems.map((item) => (
        <NavLink
          key={item.key}
          to={item.path}
          className={({ isActive }) => `
            w-[84px] lg:w-[100px] py-3 rounded-xl flex flex-col items-center gap-1.5
            transition-all duration-300 ease-out no-underline
            ${isActive
              ? 'bg-[var(--accent-primary)] text-white shadow-lg'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }
          `}
          title={item.label}
        >
          {item.icon}
          <span className="text-xs font-medium">{item.label}</span>
        </NavLink>
      ))}
    </aside>
  );
}
