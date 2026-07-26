import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  zIndex?: 'z-40' | 'z-50';
  extraLeft?: ReactNode;
  extraCenter?: ReactNode;
  extraRight?: ReactNode;
}

/**
 * 顶层导航栏通用骨架：返回按钮 + 标题/副标题 + 金币徽章 + 头像。
 * 通过 `extraLeft` / `extraCenter` / `extraRight` 注入各页差异元素（编辑按钮、进度条、状态文本等）。
 */
export default function AppHeader({
  title,
  subtitle,
  showBack = true,
  zIndex = 'z-50',
  extraLeft,
  extraCenter,
  extraRight,
}: AppHeaderProps) {
  const hasLeftGroup = showBack || subtitle || extraLeft;

  return (
    <header className={`h-14 lg:h-16 px-4 lg:px-6 border-b border-[var(--border-subtle)] bg-[var(--chrome-topbar)] backdrop-blur-md sticky top-0 ${zIndex}`}>
      <div className="h-full flex items-center justify-between">
        {/* Left Side - Back & Title */}
        {hasLeftGroup ? (
          <div className="flex items-center gap-3">
            {showBack && (
              <Link
                to="/"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
            )}
            {subtitle ? (
              <div className="flex flex-col">
                <h1 className="text-base lg:text-lg font-medium text-[var(--text-primary)]">{title}</h1>
                <span className="text-xs text-[var(--text-muted)]">{subtitle}</span>
              </div>
            ) : (
              <h1 className="text-base lg:text-lg font-medium text-[var(--text-primary)]">{title}</h1>
            )}
            {extraLeft}
          </div>
        ) : (
          <h1 className="text-base lg:text-lg font-medium text-[var(--text-primary)]">{title}</h1>
        )}

        {/* Center Slot (e.g. progress bar) */}
        {extraCenter}

        {/* Right Side - Coins & Avatar */}
        <div className="flex items-center gap-2 lg:gap-4">
          {extraRight}
          {/* Coins Badge */}
          <div className="h-7 lg:h-9 px-2 lg:px-4 rounded-full bg-[var(--accent-primary)] text-white text-xs lg:text-sm font-medium flex items-center gap-1 lg:gap-2">
            <span>10000</span>
            <span className="opacity-80 hidden sm:inline">金币 / 旗舰</span>
          </div>

          {/* Avatar */}
          <button className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center hover:ring-2 hover:ring-[var(--accent-primary)] hover:ring-offset-2 hover:ring-offset-[var(--bg-root)] transition-all duration-200">
            <span className="text-xs lg:text-sm font-medium">头像</span>
          </button>
        </div>
      </div>
    </header>
  );
}