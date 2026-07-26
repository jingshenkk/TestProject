import { useState } from 'react';
import { ChevronDown, Play, CheckCircle2, Settings, User, Building2, Gem, ImageIcon } from 'lucide-react';
import ProcessStepBar from '@/components/ProcessStepBar';
import AppHeader from '@/components/AppHeader';
import { sampleShots, videoVersions, imageAssets } from '@/mocks/videoGen';

export default function VideoGenPage() {
  const [selectedShotId, setSelectedShotId] = useState(sampleShots[0].id);
  const [selectedVersionId, setSelectedVersionId] = useState('v1');
  const [selectedEpisode] = useState('第一集：被迫封神');
  const [videoModel] = useState('Seedance Fast');
  const [resolution] = useState('1080P');
  const [aspectRatio] = useState('16:9');
  const [hasGeneratedVideo, setHasGeneratedVideo] = useState(false);

  const selectedShot = sampleShots.find(s => s.id === selectedShotId);

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      {/* Top Navigation */}
      <AppHeader title="三体2 终极之战" subtitle="视频生成" />

      {/* Page Content */}
      <main className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col min-h-0">
        {/* Process Steps */}
        <ProcessStepBar />

        {/* Toolbar - Episode & Settings */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Episode Selector */}
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-colors">
              <span>{selectedEpisode}</span>
              <ChevronDown size={16} className="text-[var(--text-muted)]" />
            </button>
          </div>

          {/* Video Model */}
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-colors">
              <Settings size={14} className="text-[var(--text-muted)]" />
              <span>{videoModel}</span>
              <ChevronDown size={16} className="text-[var(--text-muted)]" />
            </button>
          </div>

          {/* Resolution */}
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-colors">
              <span>{resolution}</span>
              <ChevronDown size={16} className="text-[var(--text-muted)]" />
            </button>
          </div>

          {/* Aspect Ratio */}
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-colors">
              <span>{aspectRatio}</span>
              <ChevronDown size={16} className="text-[var(--text-muted)]" />
            </button>
          </div>

          {/* Cost Hint */}
          <span className="text-sm text-[var(--text-muted)] ml-2">视频每 1 秒消耗 10币，以实际生成为准。</span>
        </div>

        {/* Main Content - Three Column Layout */}
        <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
          {/* Left Column - Shot List (200px fixed) */}
          <div className="w-[200px] flex flex-col gap-3 overflow-y-auto flex-shrink-0 pr-1">
            {sampleShots.map((shot) => (
              <button
                key={shot.id}
                onClick={() => setSelectedShotId(shot.id)}
                className={`p-3 rounded-xl border transition-all duration-200 text-left ${
                  selectedShotId === shot.id
                    ? 'bg-[var(--bg-card)] border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]'
                    : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                }`}
              >
                {/* Shot Header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs ${selectedShotId === shot.id ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`}>
                    {shot.code}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">{shot.duration}</span>
                  {shot.status === 'generating' && (
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center">
                      {shot.progress}%
                    </span>
                  )}
                  {shot.status === 'completed' && (
                    <CheckCircle2 size={14} className="text-green-500" />
                  )}
                </div>

                {/* Preview Placeholder */}
                <div className="aspect-[4/3] bg-[var(--bg-surface)] rounded-lg flex items-center justify-center relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    shot.status === 'completed' ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-input)]'
                  }`}>
                    <Play size={18} className={shot.status === 'completed' ? 'text-white' : 'text-[var(--text-muted)]'} fill="currentColor" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Middle Column - Main Content (flex-1) */}
          <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-y-auto">
            {/* Shot Info Card */}
            <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-medium text-[var(--text-primary)]">{selectedShot?.code}</span>
                <span className="text-sm text-[var(--text-muted)]">{selectedShot?.duration}</span>
                <span className="text-sm text-[var(--text-muted)]">中近景 · 固定 · 12.6s</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                花圃牡丹在前景虚化，湘夫人侧立花前，手指轻抚花瓣，面容沉静。背景中李公子的暗红身影从竹帘后隐约浮现。
              </p>
            </div>

            {/* Video Preview Area */}
            <div className="flex-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] flex items-center justify-center min-h-[300px] relative overflow-hidden">
              {/* Play Button Center */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-black/80 flex items-center justify-center mb-4 mx-auto cursor-pointer hover:scale-110 transition-transform">
                  <Play size={32} className="text-white ml-1" fill="white" />
                </div>
                <p className="text-sm text-[var(--text-muted)]">
                  {hasGeneratedVideo ? '点击播放视频' : '暂未生成视频'}
                </p>
              </div>
            </div>

            {/* Version Selection (Only when has video) */}
            {hasGeneratedVideo && (
              <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {videoVersions.map((version) => (
                      <button
                        key={version.id}
                        onClick={() => setSelectedVersionId(version.id)}
                        className={`w-16 h-12 rounded-lg border-2 transition-all duration-200 ${
                          selectedVersionId === version.id
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-[var(--border-default)]'
                        }`}
                      >
                        <span className="text-xs font-medium">{version.name}</span>
                      </button>
                    ))}
                  </div>
                  <button className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity">
                    设为当前版本
                  </button>
                </div>
              </div>
            )}

            {/* Prompt Input Area */}
            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-4">
              <textarea
                className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none border-none outline-none"
                rows={4}
                defaultValue="特写，固定机位，焦点从一枚从枝头自行落下的橘子，转移到它落入枯叶中的轻微动态。在屈原的橘园，风吹过橘林。画面采用低调光，色调沉郁，焦段为135mm长焦镜头，背景中的【湘夫人·主角】身影虚化，他没有去看落下的橘子，保持着原有的姿态。画面中所有角色全程不说话。"
              />
              <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-[var(--border-subtle)]">
                {!hasGeneratedVideo ? (
                  <button
                    onClick={() => setHasGeneratedVideo(true)}
                    className="px-6 py-2.5 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity"
                  >
                    生成
                  </button>
                ) : (
                  <>
                    <button className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)] transition-colors">
                      原提示词
                    </button>
                    <button className="px-6 py-2.5 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity">
                      生成
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Assets (320px fixed) */}
          <div className="w-[320px] flex flex-col gap-4 flex-shrink-0 overflow-y-auto pl-1">
            {/* First Frame Image */}
            <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">首帧图片</h4>
              <div className="aspect-[16/9] bg-[var(--bg-surface)] rounded-lg flex items-center justify-center border border-[var(--border-subtle)] mb-3">
                {!hasGeneratedVideo ? (
                  <div className="text-center">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 mx-auto text-[var(--text-muted)]" fill="none" stroke="currentColor" strokeWidth="1">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="3" y1="3" x2="21" y2="21" />
                      <line x1="21" y1="3" x2="3" y2="21" />
                    </svg>
                    <span className="text-xs text-[var(--text-muted)] mt-2 block">未生成</span>
                  </div>
                ) : (
                  <ImageIcon size={32} className="text-[var(--text-muted)]" />
                )}
              </div>
              {!hasGeneratedVideo && (
                <p className="text-xs text-[var(--accent-primary)]">建议先生成首帧图片，视频生成更符合您的期望！</p>
              )}
            </div>

            {/* Image Assets */}
            <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-subtle)] flex-1">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">图片资产</h4>
              <div className="space-y-3">
                {imageAssets.map((asset) => (
                  <div key={asset.id} className="bg-[var(--bg-surface)] rounded-lg p-3 border border-[var(--border-subtle)]">
                    <div className="aspect-[4/3] bg-[var(--bg-input)] rounded-lg flex items-center justify-center mb-2">
                      {asset.type === 'character' ? (
                        <User size={24} className="text-[var(--text-muted)]" />
                      ) : asset.type === 'scene' ? (
                        <Building2 size={24} className="text-[var(--text-muted)]" />
                      ) : (
                        <Gem size={24} className="text-[var(--text-muted)]" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--accent-primary)] font-medium">{asset.code}</span>
                      <span className="text-xs text-[var(--text-secondary)]">
                        {asset.type === 'character' ? '角色' : asset.type === 'scene' ? '场景' : '道具'}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-primary)] mt-1 truncate">
                      {asset.name} · {asset.variant} {asset.viewType}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
