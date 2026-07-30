/** Map internal status values to Chinese display labels. */
export const STATUS_LABELS: Record<string, string> = {
  // Task status
  queued: '排队中',
  running: '运行中',
  completed: '已完成',
  failed: '失败',
  pending: '等待中',
  generating: '生成中',
  // Review decisions
  pass: '通过',
  backup: '备选',
  reject: '废片',
  // Phase status
  in_progress: '进行中',
  done: '完成',
  // Asset status
  cancelled: '已取消',
  missing: '文件缺失',
}

export function statusLabel(s: string | null | undefined): string {
  if (!s) return '未知'
  return STATUS_LABELS[s] || s
}
