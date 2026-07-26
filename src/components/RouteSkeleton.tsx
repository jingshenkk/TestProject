/**
 * P3-2：路由级加载骨架。
 * 配合 React.lazy + Suspense，在页面 chunk 加载期间展示与外壳风格一致的占位，
 * 避免白屏；色调沿用设计 token，低强度脉冲提示"加载中"。
 */
export default function RouteSkeleton() {
  return (
    <div className="flex-1 flex flex-col min-w-0 animate-pulse">
      {/* 顶栏骨架 */}
      <div className="h-14 flex items-center px-6 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
        <div className="h-4 w-28 rounded bg-[var(--bg-elevated)]" />
        <div className="ml-3 h-3 w-20 rounded bg-[var(--bg-surface)]" />
        <div className="ml-auto h-6 w-6 rounded-full bg-[var(--bg-elevated)]" />
      </div>

      {/* 内容骨架：步骤条 + 卡片栅格 */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-center gap-2 mb-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 flex-1 max-w-[180px] rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)]" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]" />
          ))}
        </div>
      </div>
    </div>
  );
}