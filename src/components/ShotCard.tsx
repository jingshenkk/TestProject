import { Clock, Edit2, Film, Move } from 'lucide-react';

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
  episode?: number;
  sceneNo?: string;
  durationSeconds?: number;
  motionIntensity?: string;
  consistencyWeight?: string;
  viewType?: string;
  cameraMovement?: string;
  cameraAngle?: string;
  cameraLens?: string;
  lensFocus?: string;
  narrativeBeat?: string;
  cameraPosition?: string;
  dialogue?: string;
  characterActions?: string;
  sfx?: string;
  bgmMood?: string;
  videoMode?: string;
  firstFrameRef?: number;
  lastFrameRef?: number;
  durationBasis?: Record<string, unknown>;
  sortOrder?: number;
}

interface ShotCardProps {
  shot: Shot;
  onEdit?: (shot: Shot) => void;
}

function actionSummary(value?: string): string {
  if (!value) return '';
  try {
    const actions = JSON.parse(value);
    if (Array.isArray(actions)) {
      return actions
        .map((item) => [item?.char_id, item?.action, item?.expression].filter(Boolean).join(' · '))
        .filter(Boolean)
        .join('；');
    }
  } catch {
    // Preserve legacy plain text returned by the backend.
  }
  return value;
}

function Field({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === null || value === '') return null;
  return <span className="text-xs text-[var(--text-muted)]"><b className="font-medium text-[var(--text-secondary)]">{label}</b>{String(value)}</span>;
}

export default function ShotCard({ shot, onEdit }: ShotCardProps) {
  const actions = actionSummary(shot.characterActions);
  const frameRefs = [shot.firstFrameRef && '首帧 #' + shot.firstFrameRef, shot.lastFrameRef && '尾帧 #' + shot.lastFrameRef].filter(Boolean).join(' · ');
  const durationBasis = typeof shot.durationBasis?.summary === 'string' ? shot.durationBasis.summary : '';

  return (
    <article className="glass-panel rounded-xl p-4 transition-all duration-200 hover:border-[var(--accent-primary)]/45 hover:shadow-lg hover:shadow-[var(--accent-primary)]/10">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="rounded-lg border border-[var(--accent-primary)]/20 bg-[var(--accent-primary-bg)] px-2.5 py-1 font-mono text-xs font-semibold text-[var(--accent-primary)]">{shot.code}</span>
          <span className="inline-flex items-center gap-1 rounded-md bg-[var(--bg-input)] px-2 py-1 text-xs text-[var(--text-secondary)]"><Film size={11} className="text-[var(--accent-tertiary)]" />{shot.type}</span>
          <span className="inline-flex items-center gap-1 rounded-md bg-[var(--bg-input)] px-2 py-1 text-xs text-[var(--text-secondary)]"><Move size={11} className="text-[var(--accent-secondary)]" />{shot.movement}</span>
          <span className="inline-flex items-center gap-1 rounded-md bg-[var(--bg-input)] px-2 py-1 text-xs text-[var(--text-secondary)]"><Clock size={11} className="text-[var(--color-info)]" />{shot.duration}</span>
        </div>
        <button type="button" aria-label={'编辑 ' + shot.code} onClick={() => onEdit?.(shot)} className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-primary-bg)] hover:text-[var(--accent-primary)]"><Edit2 size={15} /></button>
      </header>

      <p className="mt-3 text-sm leading-6 text-[var(--text-primary)]">{shot.description}</p>

      {shot.tags?.length ? <div className="mt-3 flex flex-wrap gap-2">{shot.tags.map((tag) => <span key={tag} className="rounded-lg border border-[var(--accent-primary)]/15 bg-[var(--accent-primary-bg)] px-2.5 py-1 text-xs font-medium text-[var(--accent-primary)]">{tag}</span>)}</div> : null}

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-[var(--border-subtle)] pt-3">
        <Field label="场景 · " value={shot.sceneNo} />
        <Field label="镜头 · " value={shot.cameraLens} />
        <Field label="角度 · " value={shot.cameraAngle} />
        <Field label="景深 · " value={shot.lensFocus} />
        <Field label="视频模式 · " value={shot.videoMode} />
        <Field label="排序 · " value={shot.sortOrder} />
      </div>

      {shot.details ? <p className="mt-3 rounded-lg bg-[var(--bg-surface)] px-3 py-2 text-xs leading-5 text-[var(--text-secondary)]"><b className="font-medium text-[var(--text-primary)]">补充说明：</b>{shot.details}</p> : null}
      {durationBasis ? <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]"><b className="font-medium text-[var(--text-primary)]">时长依据：</b>{durationBasis}</p> : null}
      {actions ? <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]"><b className="font-medium text-[var(--text-primary)]">角色动作：</b>{actions}</p> : null}
      {shot.dialogue ? <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]"><b className="font-medium text-[var(--text-primary)]">对白：</b>{shot.dialogue}</p> : null}
      {(shot.sfx || shot.bgmMood || frameRefs) ? <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{[shot.sfx && '音效：' + shot.sfx, shot.bgmMood && '配乐：' + shot.bgmMood, frameRefs].filter(Boolean).join(' ｜ ')}</p> : null}
    </article>
  );
}
