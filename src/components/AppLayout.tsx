import type { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';

/**
 * 统一布局壳（P0）
 * 三段式骨架：左侧 Sidebar + 右侧内容区（children 渲染路由主区域）。
 * —— 消除“有的页有顶栏有的没有、padding 各异”的页框不统一问题：
 *     Sidebar 与外层 flex 壳在此处唯一声明，所有路由共用同一套页框。
 *     各页面头部（TopBar / AppHeader / VideoTopBar / StoryboardTopBar）由页面自行渲染，
 *     以保留不同工作台的差异化导航；主区域 main 的 padding 也由页面按信息密度自定。
 * app-main 提供老前端同款的顶部渐隐 cinematic 背景。
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell flex min-h-screen w-full bg-[var(--bg-root)]">
      <Sidebar />
      <div className="app-main flex-1 flex flex-col min-w-0 min-h-screen">
        {children}
      </div>
    </div>
  );
}