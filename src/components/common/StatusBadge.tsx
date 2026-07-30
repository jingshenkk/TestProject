import { statusLabel } from '../../utils/statusLabels'

const STATUS_TONES: Record<string, string> = {
  completed: 'success',
  pass: 'success',
  done: 'success',
  generating: 'info',
  running: 'info',
  in_progress: 'info',
  queued: 'warning',
  pending: 'warning',
  backup: 'warning',
  failed: 'error',
  reject: 'error',
  blocked: 'error',
  missing: 'error',
  cancelled: 'muted',
}

export default function StatusBadge({ status, label }: { status: string; label?: string }) {
  const tone = STATUS_TONES[status] || 'muted'
  return (
    <span
      className={`status-badge is-${tone}`}
    >
      <span />
      {label || statusLabel(status)}
    </span>
  )
}
