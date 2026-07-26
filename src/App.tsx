import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import RouteSkeleton from '@/components/RouteSkeleton';

// P3-2：页面懒加载，配合 Suspense + RouteSkeleton 实现按路由分块与加载态兜底
const HomePage = lazy(() => import('@/pages/HomePage'));
const VideoPage = lazy(() => import('@/pages/VideoPage'));
const VideoGenPage = lazy(() => import('@/pages/VideoGenPage'));
const StoryboardPage = lazy(() => import('@/pages/StoryboardPage'));
const ImageCreationPage = lazy(() => import('@/pages/ImageCreationPage'));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'));
const PostProductionPage = lazy(() => import('@/pages/PostProductionPage'));

function PlaceholderPage({ name }: { name: string }) {
  return (
    <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)]">
      {name}页面开发中...
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
      <p className="text-5xl font-semibold text-[var(--text-primary)]">404</p>
      <p className="text-sm text-[var(--text-secondary)]">页面不存在或已被移动</p>
      <Link
        to="/"
        className="mt-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity"
      >
        返回首页
      </Link>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* P0：统一布局壳 AppLayout（Sidebar + 内容区），路由作为其子级由 <Outlet/> 渲染 */}
      <AppLayout>
        {/* Main Content：ErrorBoundary 兜渲染异常，Suspense 兜懒加载 chunk */}
        <ErrorBoundary>
          <Suspense fallback={<RouteSkeleton />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/video" element={<VideoPage />} />
              <Route path="/storyboard" element={<StoryboardPage />} />
              {/* Image Creation page */}
              <Route path="/image" element={<ImageCreationPage />} />
              <Route path="/video-gen" element={<VideoGenPage />} />
              <Route path="/post" element={<PostProductionPage />} />
              <Route path="/post/:id" element={<PostProductionPage />} />
              <Route path="/tools" element={<PlaceholderPage name="工具" />} />
              <Route path="/space" element={<PlaceholderPage name="空间" />} />
              <Route path="/assets" element={<PlaceholderPage name="素材" />} />
              <Route path="/projects" element={<ProjectsPage />} />
              {/* 404 兜底：未匹配路径展示提示并提供返回首页入口，避免主区域白屏 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;