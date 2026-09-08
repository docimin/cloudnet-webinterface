export default function PageHeader({
  count,
  caption,
  children
}: {
  count: number
  caption: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-1">
        <div className="font-mono text-2xl font-semibold tabular-nums">
          {count}
        </div>
        <p className="text-sm text-muted-foreground">{caption}</p>
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-3">{children}</div>
      )}
    </div>
  )
}
