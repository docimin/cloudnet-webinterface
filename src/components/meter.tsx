import { cn } from '@/lib/utils'

export type LoadLevel = 'normal' | 'high' | 'critical'

export function loadLevel(percent: number): LoadLevel {
  if (percent >= 90) return 'critical'
  if (percent >= 70) return 'high'
  return 'normal'
}

// Normal load keeps the default foreground; only pressure earns a colour.
export function loadTone(percent: number) {
  const level = loadLevel(percent)
  if (level === 'critical') return 'text-load-critical'
  if (level === 'high') return 'text-load-high'
  return undefined
}

const FILL: Record<LoadLevel, string> = {
  normal: 'bg-load-normal',
  high: 'bg-load-high',
  critical: 'bg-load-critical'
}

export default function Meter({
  value,
  label,
  valueText,
  className
}: {
  value: number
  label: string
  valueText?: string
  className?: string
}) {
  const percent = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      aria-valuetext={valueText}
      className={cn(
        'h-1.5 w-full overflow-hidden rounded-full bg-muted',
        className
      )}
    >
      <div
        className={cn(
          'meter-fill h-full rounded-full transition-all',
          FILL[loadLevel(percent)]
        )}
        // Only the proportion travels from data to CSS; the meter-fill
        // utility in globals.css owns the geometry.
        style={{ '--meter-value': percent } as React.CSSProperties}
      />
    </div>
  )
}
