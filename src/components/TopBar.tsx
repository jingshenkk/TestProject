import { User, Menu } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="h-14 lg:h-16 flex items-center justify-between px-4 lg:px-6 border-b border-[var(--border-subtle)] bg-[var(--chrome-topbar)] backdrop-blur-md sticky top-0 z-50">
      {/* Left Side - Mobile Menu Button (hidden on larger screens) */}
      <button className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]">
        <Menu size={20} />
      </button>

      {/* Title could go here */}
      <div className="hidden lg:block" />

      {/* Right Side */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Coins Badge */}
        <div className="h-7 lg:h-9 px-2 lg:px-4 rounded-full bg-[var(--accent-primary)] text-white text-xs lg:text-sm font-medium flex items-center gap-1 lg:gap-2">
          <span>10000</span>
          <span className="opacity-80 hidden sm:inline">金币 / 旗舰</span>
        </div>

        {/* Avatar */}
        <button className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center hover:ring-2 hover:ring-[var(--accent-primary)] hover:ring-offset-2 hover:ring-offset-[var(--bg-root)] transition-all duration-200">
          <User size={16} className="lg:w-5 lg:h-5" />
        </button>
      </div>
    </header>
  );
}
