import { useMemo, useState, type ReactNode } from 'react';

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

/** Shared responsive layout for character, scene, and prop asset details. */
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
  const selectedImage = images.find((image) => image.id === selectedImageId);
  const uniqueVersions = useMemo(
    () => versions.filter((version, index) => versions.findIndex((candidate) => candidate.name === version.name) === index),
    [versions],
  );
  const [currentVersionId, setCurrentVersionId] = useState(
    () => uniqueVersions.find((version) => version.isCurrent)?.id || uniqueVersions[0]?.id || '',
  );
  const currentVersion = uniqueVersions.find((version) => version.id === currentVersionId);

  return (
    <div className="asset-detail-shell h-full min-w-0 flex flex-col">
      <header className="asset-detail-topbar mb-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={onBack} className="shrink-0 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">返回</button>
          <h3 className="truncate text-base font-semibold text-[var(--text-primary)]">{title}</h3>
        </div>
        <div className="asset-detail-switches" aria-label="同类资产切换">
          {switchList.map((item) => (
            <button key={item.id} type="button" onClick={() => onSelectSwitchId(item.id)} className={'asset-detail-switch ' + (selectedSwitchId === item.id ? 'is-active' : '')} title={item.code + ' · ' + item.name}>
              <span className="truncate">{item.code} · {item.name}</span>
              <span className="asset-detail-switch-count">{item.current}/{item.total}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="asset-detail-grid flex-1 min-h-0">
        <aside className="asset-detail-types" aria-label="资产图像类型">
          {images.map((image) => (
            <button key={image.id} type="button" onClick={() => onSelectImageId(image.id)} className={'asset-detail-type ' + (selectedImageId === image.id ? 'is-active' : '')}>
              <span className={'asset-detail-type-icon ' + (image.hasImage ? 'has-image' : '')} aria-hidden="true">▧</span>
              <span className="min-w-0 truncate">{image.name}</span>
            </button>
          ))}
        </aside>

        <main className="asset-detail-preview min-w-0">
          <div className="asset-detail-heading">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.12em] text-[var(--accent-primary)]">ASSET PREVIEW</p>
              <h2 className="mt-1 truncate text-lg font-semibold text-[var(--text-primary)]">{asset.name} · {selectedImage?.name || '未选择图像'}</h2>
            </div>
            <div className="asset-detail-meta" aria-label="图像信息"><span>{asset.code}_S01</span><span>1024 × 1024</span><span>2026-07-13 15:32</span></div>
          </div>

          <div className="asset-detail-preview-stage">{preview}</div>

          <section className="asset-version-panel" aria-label="版本历史">
            <div className="asset-version-heading"><div><p className="text-sm font-semibold text-[var(--text-primary)]">版本历史</p><p className="mt-1 text-xs text-[var(--text-muted)]">选择一个版本后再设为当前版本。</p></div>{currentVersion && <span className="asset-current-version">当前 · {currentVersion.name}</span>}</div>
            <div className="asset-version-list" role="radiogroup" aria-label="选择版本">
              {uniqueVersions.map((version) => (
                <button key={version.id} type="button" role="radio" aria-checked={selectedVersionId === version.id} onClick={() => onSelectVersionId(version.id)} className={'asset-version-item ' + (selectedVersionId === version.id ? 'is-selected' : '')}>
                  <span className="asset-version-thumb" aria-hidden="true">{version.name}</span><span className="truncate">{version.name}</span>{currentVersionId === version.id && <span className="asset-version-current">当前</span>}
                </button>
              ))}
            </div>
            <button type="button" disabled={!selectedVersionId || selectedVersionId === currentVersionId} onClick={() => setCurrentVersionId(selectedVersionId)} className="btn btn-primary asset-version-apply">设为当前版本</button>
          </section>

          <footer className="asset-detail-actionbar"><div className="flex flex-wrap items-center gap-2"><button type="button" className="btn btn-secondary">严谨模式</button><button type="button" className="btn btn-secondary">原提示词</button></div><button type="button" className="btn btn-primary">修改生图 <span className="asset-cost-badge">5 币</span></button></footer>
        </main>

        <aside className="asset-detail-sidebar">{rightPanel}</aside>
      </div>
    </div>
  );
}
