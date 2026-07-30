import type { Asset } from '@/types/asset';

interface ImageAssetCardProps {
  asset: Asset;
  onClick?: (asset: Asset) => void;
  onGenerate?: (asset: Asset) => void;
  generateLabel?: string;
  disabled?: boolean;
}

export default function ImageAssetCard({ asset, onClick, onGenerate, generateLabel = '\u67e5\u770b\u4e0e\u521b\u4f5c', disabled = false }: ImageAssetCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(asset)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.(asset);
        }
      }}
      className="glass-panel rounded-xl overflow-hidden cursor-pointer hover:ring-1 hover:ring-[var(--accent-primary)]/30 transition-all duration-200 group"
    >
      <div className="aspect-[4/3] bg-[var(--bg-surface)] relative overflow-hidden">
        {asset.hasImage && asset.imageUrl ? (
          <img src={asset.imageUrl} alt={asset.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <svg viewBox="0 0 100 100" className="w-16 h-16 mx-auto mb-2 text-[var(--border-default)]" fill="none" stroke="currentColor" strokeWidth="1">
                <line x1="10" y1="10" x2="90" y2="90" />
                <line x1="90" y1="10" x2="10" y2="90" />
              </svg>
              <span className="text-sm text-[var(--text-muted)]">{'\u672a\u751f\u6210\u56fe\u7247'}</span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-[var(--accent-primary)]/0 group-hover:bg-[var(--accent-primary)]/5 transition-colors duration-200" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-base font-semibold text-[var(--text-primary)]">{asset.name}</span>
            <span className="shrink-0 text-xs text-[var(--text-muted)] font-mono">{asset.code}</span>
          </div>
          <span className="shrink-0 px-2 py-0.5 rounded-full bg-[var(--accent-primary)] text-white text-xs font-medium">{asset.currentVersion}/{asset.totalVersions}</span>
        </div>
        <p className="min-h-10 text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">{asset.description}</p>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onGenerate?.(asset);
          }}
          disabled={disabled}
          className="w-full py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generateLabel}
        </button>
      </div>
    </div>
  );
}
