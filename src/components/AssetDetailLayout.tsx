import type { ReactNode } from 'react';

export interface AssetSwitchItem {
  id: string;
  code: string;
  name: string;
  current: number;
  total: number;
}

export interface AssetDetailImage {
  id: string;
  name: string;
  hasImage: boolean;
}

export interface AssetDetailVersion {
  id: string;
  name: string;
  isCurrent: boolean;
}

interface AssetDetailLayoutProps {
  title: string;
  asset: { name: string; code: string };
  switchList: AssetSwitchItem[];
  selectedSwitchId: string;
  onSelectSwitchId: (id: string) => void;
  images: AssetDetailImage[];
  selectedImageId: string;
  onSelectImageId: (id: string) => void;
  versions: AssetDetailVersion[];
  selectedVersionId: string;
  onSelectVersionId: (id: string) => void;
  preview: ReactNode;
  rightPanel: ReactNode;
  onBack?: () => void;
}

/**
 * 资产详情通用骨架：顶栏（返回 + 标题 + 同类切换）+ 左列图片选择 +
 * 中列（头部 / 预览插槽 / 版本条 / 操作按钮）+ 右列插槽。
 * 角色 / 场景 / 道具详情通过 `preview` 与 `rightPanel` 差异化。
 */
export default function AssetDetailLayout({
  title,
  asset,
  switchList,
  selectedSwitchId,
  onSelectSwitchId,
  images,
  selectedImageId,
  onSelectImageId,
  versions,
  selectedVersionId,
  onSelectVersionId,
  preview,
  rightPanel,
  onBack,
}: AssetDetailLayoutProps) {
  const selectedImage = images.find((img) => img.id === selectedImageId);

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar - Switch Tabs */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mr-2"
          >
            ← 返回
          </button>
          <h3 className="text-base font-medium text-[var(--text-primary)]">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {switchList.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectSwitchId(item.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                selectedSwitchId === item.id
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>{item.code} · {item.name}</span>
              <span className={`text-xs ${selectedSwitchId === item.id ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
                {item.current}/{item.total}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Horizontal 3-Column Layout */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Left Column - Fixed 200px */}
        <div className="w-[200px] flex flex-col gap-3 overflow-y-auto flex-shrink-0">
          {images.map((image) => (
            <button
              key={image.id}
              onClick={() => onSelectImageId(image.id)}
              className={`p-3 rounded-xl text-left transition-all duration-200 border ${
                selectedImageId === image.id
                  ? 'bg-[var(--bg-card)] border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-default)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  image.hasImage ? 'bg-[var(--accent-primary)]/10' : 'bg-[var(--bg-input)]'
                }`}>
                  <svg viewBox="0 0 24 24" className={`w-6 h-6 ${image.hasImage ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`} fill="currentColor">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                </div>
                <span className={`text-sm font-medium leading-tight ${
                  selectedImageId === image.id ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'
                }`}>
                  {image.name}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Middle Column - Flexible */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Image Info Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2">
              <span>{asset.name}</span>
              <span className="text-[var(--text-secondary)]">·</span>
              <span>{selectedImage?.name}</span>
            </h2>
            <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
              <span className="text-[var(--accent-primary)] font-medium">{asset.code}_S01</span>
              <span>2026-7-13 15:32:56</span>
              <span>1024*1024</span>
            </div>
          </div>

          {/* Main Preview Content */}
          <div className="flex-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-4 overflow-hidden flex flex-col">
            {preview}
          </div>

          {/* Version Selection Bar */}
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {versions.map((version) => (
                  <button
                    key={version.id}
                    onClick={() => onSelectVersionId(version.id)}
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

          {/* Action Buttons */}
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)] transition-colors">
                  严谨
                </button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)] transition-colors">
                  原提示词
                </button>
              </div>
              <button className="px-5 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity">
                修改生图 5币
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Fixed 340px */}
        <div className="w-[340px] flex flex-col gap-4 overflow-y-auto flex-shrink-0">
          {rightPanel}
        </div>
      </div>
    </div>
  );
}