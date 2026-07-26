import { NavLink } from 'react-router-dom';

interface Step {
  key: string;
  label: string;
  path: string;
}

const steps: Step[] = [
  { key: 'script', label: '剧本创作', path: '/video' },
  { key: 'storyboard', label: '分镜创作', path: '/storyboard' },
  { key: 'image', label: '图像创作', path: '/image' },
  { key: 'video', label: '视频生成', path: '/video-gen' },
  { key: 'post', label: '后期制作', path: '/post' },
];

export default function ProcessStepBar() {
  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center gap-2 flex-shrink-0">
          {/* Step Button */}
          <NavLink
            to={step.path}
            className={({ isActive }) => `
              h-10 px-5 rounded-lg text-sm font-medium whitespace-nowrap
              transition-all duration-200 no-underline
              ${isActive
                ? 'bg-[var(--accent-primary)] text-white'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
              }
            `}
          >
            {step.label}
          </NavLink>

          {/* Arrow (not for last step) */}
          {index < steps.length - 1 && (
            <div className="flex-shrink-0 w-6 flex items-center justify-center">
              <div className="w-full h-[1px] bg-[var(--border-default)] relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[4px] border-l-[var(--border-default)] border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
