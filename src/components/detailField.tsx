import { cn } from '@/lib/utils'

export default function DetailField({
  label,
  value,
  mono = true
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b py-2 last:border-0 last:pb-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={cn('truncate text-sm', mono && 'font-mono tabular-nums')}>
        {value}
      </dd>
    </div>
  )
}
