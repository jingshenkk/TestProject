import { RotateCw } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

interface VideoTopBarProps {
  title?: string;
  progress?: number;
  subtitle?: string;
}

export default function VideoTopBar({
  title = '三体2 终极之战',
  progress = 14,
  subtitle = '最近：角色三视图'
}: VideoTopBarProps) {
  const extraCenter = (
    <div className="hidden md:flex items-center gap-4 flex-1 justify-center max-w-md">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[var(--color-success)]">空闲</span>
        <span className="text-[var(--text-muted)]">最近：{subtitle}</span>
      </div>
      <div className="flex-1 max-w-[200px]">
        <div className="h-2 bg-[var(--bg-input)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-[var(--accent-primary)] font-medium">{progress}%</span>
    </div>
  );

  const extraRight = (
    <>
      {/* Status Text */}
      <span className="hidden sm:block text-xs text-[var(--text-muted)]">
        12/88 湖夫人 · 素白寝衣 (.. 缺76 异0
      </span>

      {/* Refresh Button */}
      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors">
        <RotateCw size={16} />
      </button>
    </>
  );

  return <AppHeader title={title} extraCenter={extraCenter} extraRight={extraRight} />;
}