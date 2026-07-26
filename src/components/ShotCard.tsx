import { Edit2, Clock, Move, Film } from 'lucide-react';

// 分镜数据类型
export interface Shot {
  id: string;
  backendId?: number;
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
    <div className="glass-panel p-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[var(--accent-primary)]/10 group relative overflow-hidden">
      {/* 悬停边框效果 */}
      <div className="absolute inset-0 rounded-xl border border-[var(--accent-primary)]/0 group-hover:border-[var(--accent-primary)]/30 transition-all duration-300 pointer-events-none" />

      {/* Header - Code & Type */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* 镜头编号 */}
          <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[var(--accent-primary)]/20 to-[var(--accent-primary)]/10 text-xs font-mono font-semibold text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
            {shot.code}
          </span>

          {/* 类型标签 */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--bg-input)] text-xs text-[var(--text-secondary)]">
            <Film size={10} className="text-[var(--accent-tertiary)]" />
            <span>{shot.type}</span>
          </div>

          {/* 运镜标签 */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--bg-input)] text-xs text-[var(--text-secondary)]">
            <Move size={10} className="text-[var(--accent-secondary)]" />
            <span>{shot.movement}</span>
          </div>

          {/* 时长标签 */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--bg-input)] text-xs text-[var(--text-secondary)]">
            <Clock size={10} className="text-[var(--color-info)]" />
            <span>{shot.duration}</span>
          </div>
        </div>

        {/* 编辑按钮 */}
        <button
          onClick={() => onEdit?.(shot)}
          className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--accent-primary-bg)] hover:text-[var(--accent-primary)] transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Edit2 size={14} />
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-3 group-hover:text-[var(--text-primary)]/90">
        {shot.description}
      </p>

      {/* Tags */}
      {shot.tags && shot.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {shot.tags.map((tag, index) => {
            const colors = [
              'from-[var(--accent-primary)]/15 to-[var(--accent-primary)]/5 text-[var(--accent-primary)]',
              'from-[var(--accent-secondary)]/15 to-[var(--accent-secondary)]/5 text-[var(--accent-secondary)]',
              'from-[var(--accent-tertiary)]/15 to-[var(--accent-tertiary)]/5 text-[var(--accent-tertiary)]',
            ];
            return (
              <span
                key={tag}
                className={`px-2.5 py-1 rounded-lg bg-gradient-to-r ${colors[index % colors.length]} text-xs font-medium border border-current/10`}
              >
                {tag}
              </span>
            );
          })}
        </div>
      )}

      {/* Details */}
      {shot.details && (
        <div className="pt-3 border-t border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {shot.details}
          </p>
        </div>
      )}
    </div>
  );
}
