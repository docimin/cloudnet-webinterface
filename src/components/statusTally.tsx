import { useTranslations } from 'gt-tanstack-start'
import { type Status, StatusIndicator } from '@/components/status'

export default function StatusTally({
  counts
}: {
  counts: Partial<Record<Status, number>>
}) {
  const statusT = useTranslations('Status')
  const present = (Object.keys(counts) as Status[]).filter((s) => counts[s])

  if (!present.length) {
    return (
      <span className="text-xs text-muted-foreground">{statusT('none')}</span>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {present.map((status) => (
        <span key={status} className="flex items-center gap-1.5">
          <StatusIndicator status={status} label={statusT(status)} />
          <span className="font-mono text-xs tabular-nums">
            {counts[status]}
          </span>
          <span className="text-xs text-muted-foreground">
            {statusT(status)}
          </span>
        </span>
      ))}
    </div>
  )
}
