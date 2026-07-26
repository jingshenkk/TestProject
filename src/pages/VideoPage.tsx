import { useLocation, useNavigate } from 'react-router-dom';
import { FolderOpen, ArrowLeft } from 'lucide-react';
import VideoTopBar from '@/components/VideoTopBar';
import ProcessStepBar from '@/components/ProcessStepBar';
import CreationInput from '@/components/CreationInput';
import ScriptSettings from '@/components/ScriptSettings';
import GenerateButtons from '@/components/GenerateButtons';
import EpisodeList from '@/components/EpisodeList';
import type { Project } from '@/mocks/projects';

/**
 * 视频模块
 * —— P-路由：仅当「由项目点击跳转」到达（location.state 携带 project）时才进入创作页面。
 *     若用户直接从侧栏点击「视频」进入（无 state），则展示空态「暂未选择任何项目进行创作」，
 *     避免视频模块默认就铺开创作 UI 造成"凭空出现一个项目"的困惑。
 */
export default function VideoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const project = (location.state as { project?: Project } | null)?.project ?? null;

  // 未选择项目：空态
  if (!project) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        <VideoTopBar title="视频创作" progress={0} subtitle="未选择项目" />
        <main className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div className="empty-frame flex flex-col items-center justify-center gap-5 text-center max-w-md w-full px-6 py-16 rounded-2xl relative overflow-hidden animate-fade-in">
            {/* 背景极光缓动 */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 30%, rgba(59,164,255,0.10) 0%, transparent 60%)',
                animation: 'sidebar-breathe 6s ease-in-out infinite',
              }}
            />
            <div className="relative w-16 h-16 rounded-2xl bg-[var(--accent-primary-bg)] flex items-center justify-center">
              <FolderOpen size={28} className="text-[var(--accent-primary)]" />
            </div>
            <div className="relative space-y-1.5">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                暂未选择任何项目进行创作
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                前往项目模块选择一个已有项目，或创建新项目后即可开始视频创作。
              </p>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="relative btn btn-ghost btn-sm flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              前往项目
            </button>
          </div>
        </main>
      </div>
    );
  }

  // 已选择项目：展示创作页面
  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Top Navigation - Video Page Version */}
      <VideoTopBar
        title={project.name}
        progress={14}
        subtitle="角色三视图"
      />

      {/* Page Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        {/* Process Steps */}
        <ProcessStepBar />

        {/* Creation Input Area */}
        <CreationInput
          options={{
            type: '短剧-神话故事',
            style: '视觉风格',
            format: '竖屏（9:16）12集 · 120s',
            model: 'ChatGPT',
          }}
          containerClassName="mb-6"
        />

        {/* Script Settings */}
        <ScriptSettings />

        {/* Generate Buttons */}
        <GenerateButtons />

        {/* Episode List */}
        <EpisodeList />
      </main>
    </div>
  );
}