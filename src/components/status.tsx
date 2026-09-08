import { cn } from '@/lib/utils'

export type Status = 'running' | 'starting' | 'stopped' | 'error' | 'draining'

const TONE: Record<Status, string> = {
  running: 'text-status-running',
  starting: 'text-status-starting',
  stopped: 'text-status-stopped',
  error: 'text-status-error',
  draining: 'text-status-draining'
}

// Shape carries the same information as colour so the state survives
// greyscale and colour-blindness.
const MARK: Record<Status, string> = {
  running: 'size-2 rounded-full bg-current',
  starting:
    'size-2 rounded-full border-2 border-current bg-linear-to-r from-current from-50% to-transparent to-50%',
  stopped: 'size-2 rounded-full border border-current',
  error: 'size-2 rotate-45 border-l-2 border-t-2 border-current',
  draining: 'size-2 rounded-xs border-2 border-current'
}

export function StatusIndicator({
  status,
  label,
  showLabel = false
}: {
  status: Status
  label: string
  showLabel?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', TONE[status])}>
      {showLabel ? (
        <span
          aria-hidden="true"
          data-status={status}
          className={MARK[status]}
        />
      ) : (
        <span
          role="img"
          aria-label={label}
          data-status={status}
          className={MARK[status]}
        />
      )}
      {showLabel && <span className="text-xs">{label}</span>}
    </span>
  )
}
