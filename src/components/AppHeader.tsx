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
    <header className={`h-14 lg:h-16 px-4 lg:px-6 border-b border-[var(--border-subtle)] bg-[var(--chrome-topbar)] backdrop-blur-xl sticky top-0 ${zIndex} relative overflow-hidden`}>
      {/* 顶部渐变线 */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)]/30 to-transparent" />

      <div className="h-full flex items-center justify-between relative z-10">
        {/* Left Side - Back & Title */}
        {hasLeftGroup ? (
          <div className="flex items-center gap-3 animate-fade-in">
            {showBack && (
              <Link
                to="/"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <ArrowLeft size={20} />
              </Link>
            )}
            {subtitle ? (
              <div className="flex flex-col">
                <h1 className="text-base lg:text-lg font-semibold text-[var(--text-primary)]">{title}</h1>
                <span className="text-xs text-[var(--accent-primary)]">{subtitle}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[var(--accent-primary)] to-[var(--accent-secondary)]" />
                <h1 className="text-base lg:text-lg font-semibold text-[var(--text-primary)]">{title}</h1>
              </div>
            )}
            {extraLeft}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[var(--accent-primary)] to-[var(--accent-secondary)]" />
            <h1 className="text-base lg:text-lg font-semibold text-[var(--text-primary)]">{title}</h1>
          </div>
        )}

        {/* Center Slot (e.g. progress bar) */}
        {extraCenter}

        {/* Right Side - Coins & Avatar */}
        <div className="flex items-center gap-3 lg:gap-4">
          {extraRight}
          {/* Coins Badge - 旗舰版 */}
          <div className="hidden sm:flex h-8 lg:h-10 pl-3 pr-4 rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary-dim)] text-white text-xs lg:text-sm font-medium items-center gap-2 shadow-lg shadow-[var(--accent-primary)]/25 relative overflow-hidden">
            <span className="relative z-10">10,000</span>
            <span className="opacity-85 text-[10px] hidden md:inline">旗舰</span>
            {/* 微光 */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer-sweep_3s_infinite]" />
          </div>

          {/* Avatar */}
          <button className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white flex items-center justify-center hover:ring-2 hover:ring-[var(--accent-primary)] hover:ring-offset-2 hover:ring-offset-[var(--bg-root)] transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden">
            <span className="text-xs lg:text-sm font-medium relative z-10">头像</span>
            {/* 旋转光环 */}
            <span className="absolute inset-0 rounded-full border-2 border-dashed border-white/20 animate-spin" style={{ animationDuration: '10s' }} />
          </button>
        </div>
      </div>
    </header>
  );
}