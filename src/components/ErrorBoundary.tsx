import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** 自定义兜底 UI；不传则用默认错误页 */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * P3-2：路由级错误边界。
 * 捕获子树渲染异常，避免整页白屏；保留外层 Sidebar 可用，提供"刷新/回首页"降级。
 * 注：React 19 仍以 class 组件实现 ErrorBoundary（函数组件无 getDerivedStateFromError 等价物）。
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // TODO: 接入监控上报（Sentry / 自建埋点），当前仅控制台输出便于排障
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] 渲染异常:', error, info.componentStack);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
        <p className="text-2xl font-semibold text-[var(--text-primary)]">页面出错了</p>
        <p className="text-sm text-[var(--text-secondary)] max-w-md">
          渲染过程中发生异常。可尝试刷新当前页面，或返回首页继续操作。
        </p>
        {import.meta.env.DEV && (
          <pre className="text-xs text-left text-[var(--color-error)] bg-[var(--bg-input)] rounded-lg p-3 max-w-xl overflow-auto border border-[var(--border-subtle)]">
            {error.message}
          </pre>
        )}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity"
          >
            刷新页面
          </button>
          <Link
            to="/"
            onClick={this.reset}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] border border-[var(--border-default)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }
}