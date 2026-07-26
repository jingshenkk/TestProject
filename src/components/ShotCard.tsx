import { Edit2 } from 'lucide-react';

// 分镜数据类型
export interface Shot {
  id: string;
  code: string;
  type: string;
  movement: string;
  duration: string;
  description: string;
  tags?: string[];
  details?: string;
  // 编辑弹窗新增字段
  sceneNo?: string;
  durationSeconds?: number;
  motionIntensity?: string;
  consistencyWeight?: string;
  viewType?: string;
  cameraMovement?: string;
  cameraAngle?: string;
  lensFocus?: string;
  narrativeBeat?: string;
  cameraPosition?: string;
  dialogue?: string;
}

interface ShotCardProps {
  shot: Shot;
  onEdit?: (shot: Shot) => void;
}

export default function ShotCard({ shot, onEdit }: ShotCardProps) {
  return (
    <div className="glass-panel p-4 rounded-xl hover:ring-1 hover:ring-[var(--accent-primary)]/30 transition-all duration-200">
      {/* Header - Code & Type */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded bg-[var(--bg-input)] text-xs font-mono text-[var(--text-secondary)]">
            {shot.code}
          </span>
          <span className="text-sm text-[var(--text-secondary)]">
            {shot.type}·{shot.movement}·{shot.duration}
          </span>
        </div>
        <button
          onClick={() => onEdit?.(shot)}
          className="p-1.5 rounded text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--accent-primary)] transition-colors"
        >
          <Edit2 size={14} />
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-3">
        {shot.description}
      </p>

      {/* Tags */}
      {shot.tags && shot.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {shot.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded bg-[var(--accent-primary)]/10 text-xs text-[var(--accent-primary)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Details */}
      {shot.details && (
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          {shot.details}
        </p>
      )}
    </div>
  );
}
