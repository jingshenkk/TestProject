import { NavLink } from 'react-router-dom';
import { FileText, LayoutGrid, Image, Video, Wand2 } from 'lucide-react';

interface Step {
  key: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  { key: 'script', label: '剧本创作', path: '/video', icon: <FileText size={14} /> },
  { key: 'storyboard', label: '分镜创作', path: '/storyboard', icon: <LayoutGrid size={14} /> },
  { key: 'image', label: '图像创作', path: '/image', icon: <Image size={14} /> },
  { key: 'video', label: '视频生成', path: '/video-gen', icon: <Video size={14} /> },
  { key: 'post', label: '后期制作', path: '/post', icon: <Wand2 size={14} /> },
];

export default function ProcessStepBar() {
  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center gap-2 flex-shrink-0 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
          {/* Step Button */}
          <NavLink
            to={step.path}
            className={({ isActive }) => `
              h-11 px-4 lg:px-5 rounded-xl text-sm font-medium whitespace-nowrap
              transition-all duration-300 no-underline flex items-center gap-2 relative overflow-hidden
              ${isActive
                ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary-dim)] text-white shadow-lg shadow-[var(--accent-primary)]/25'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/40 hover:bg-[var(--bg-surface)]'
              }
            `}
          >
            {/* 悬停微光 */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-700" />

            {/* 图标 */}
            <span className={`transition-all duration-300 ${({ isActive }: { isActive: boolean }) => isActive ? 'text-white' : 'text-[var(--text-muted)]'}`}>
              {step.icon}
            </span>

            <span className="relative z-10">{step.label}</span>

            {/* 激活指示器 */}
            {({ isActive }: { isActive: boolean }) => isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-white/50 rounded-full" />
            )}
          </NavLink>

          {/* Arrow (not for last step) */}
          {index < steps.length - 1 && (
            <div className="flex-shrink-0 w-6 flex items-center justify-center">
              <div className="w-full h-[2px] bg-gradient-to-r from-[var(--border-default)] to-[var(--border-subtle)] relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[5px] border-l-[var(--border-default)] border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
