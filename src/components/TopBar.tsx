import { User, Menu, Sparkles, Crown } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="h-14 lg:h-16 flex items-center justify-between px-4 lg:px-6 border-b border-[var(--border-subtle)] bg-[var(--chrome-topbar)] backdrop-blur-xl sticky top-0 z-50 relative overflow-hidden">
      {/* 顶部辉光 */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)]/50 to-transparent" />

      {/* Left Side - Mobile Menu Button (hidden on larger screens) */}
      <button className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-all duration-200 active:scale-95">
        <Menu size={20} />
      </button>

      {/* 页面标题 - 居左对齐 */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <span className="text-xs">首页</span>
          <span className="text-[var(--border-strong)]">/</span>
          <span className="text-sm font-medium text-[var(--text-primary)]">创作中心</span>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* 创作积分徽章 */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <Sparkles size={14} className="text-[var(--accent-tertiary)]" />
          <span className="text-xs text-[var(--text-secondary)]">创作积分</span>
          <div className="w-px h-3 bg-[var(--border-default)]" />
          <span className="text-xs font-medium text-[var(--text-primary)]">2,450</span>
        </div>

        {/* Coins Badge - 旗舰版 */}
        <div className="h-8 lg:h-10 pl-3 pr-4 rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary-dim)] text-white text-xs lg:text-sm font-medium flex items-center gap-2 shadow-lg shadow-[var(--accent-primary)]/25 relative overflow-hidden group cursor-pointer">
          {/* 微光动画 */}
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-out" />
          <Crown size={14} className="text-yellow-300" />
          <span className="relative z-10">10,000</span>
          <span className="opacity-85 text-[10px] lg:text-xs hidden md:inline">旗舰</span>
        </div>

        {/* 分隔线 */}
        <div className="w-px h-6 bg-[var(--border-subtle)] hidden sm:block" />

        {/* Avatar */}
        <button className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white flex items-center justify-center relative group overflow-hidden shadow-lg shadow-[var(--accent-primary)]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--accent-primary)]/30 hover:scale-105 active:scale-95">
          {/* 旋转光环 */}
          <span className="absolute inset-0 rounded-full border-2 border-dashed border-white/30 animate-spin" style={{ animationDuration: '8s' }} />
          <User size={18} className="relative z-10" />
          {/* 在线状态指示 */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[var(--color-success)] rounded-full border-2 border-[var(--chrome-topbar)]" />
        </button>
      </div>
    </header>
  );
}
