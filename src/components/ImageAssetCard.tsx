import type { Asset } from '@/types/asset';

interface ImageAssetCardProps {
  asset: Asset;
  onClick?: (asset: Asset) => void;
}

export default function ImageAssetCard({ asset, onClick }: ImageAssetCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(asset)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(asset);
        }
      }}
      className="glass-panel rounded-xl overflow-hidden cursor-pointer hover:ring-1 hover:ring-[var(--accent-primary)]/30 transition-all duration-200 group"
    >
      {/* Image Preview Area */}
      <div className="aspect-[4/3] bg-[var(--bg-surface)] relative overflow-hidden">
        {asset.hasImage && asset.imageUrl ? (
          <img src={asset.imageUrl} alt={asset.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              {/* Cross icon for empty state */}
              <svg
                viewBox="0 0 100 100"
                className="w-16 h-16 mx-auto mb-2 text-[var(--border-default)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <line x1="10" y1="10" x2="90" y2="90" />
                <line x1="90" y1="10" x2="10" y2="90" />
              </svg>
              <span className="text-sm text-[var(--text-muted)]">未生成图片</span>
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-[var(--accent-primary)]/0 group-hover:bg-[var(--accent-primary)]/5 transition-colors duration-200" />
      </div>

      {/* Info Area */}
      <div className="p-4">
        {/* Name & Code & Version Tag */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-[var(--text-primary)]">
              {asset.name}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              {asset.code}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[var(--accent-primary)] text-white text-xs font-medium">
            {asset.currentVersion}/{asset.totalVersions}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          {asset.description}
        </p>

        {/* Generate All Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // TODO: 接入真实"生成所有"业务回调
          }}
          className="w-full py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity"
        >
          生成所有
        </button>
      </div>
    </div>
  );
}
