import { useRouteContext } from '@tanstack/react-router'
import type { Status } from '@/components/status'
import StatusTally from '@/components/statusTally'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function useAllowed(permissions: string[]) {
  const { permissions: held } = useRouteContext({ from: '/{-$locale}/_authed' })
  return permissions.some((permission) => held.includes(permission))
}

export const DashboardCard = ({ title, icon, value, permissions }) => {
  const allowed = useAllowed(permissions)
  if (!allowed) return null

  return (
    <Card className="transition-colors hover:border-ring">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-2xl font-semibold tabular-nums">
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

export const StatusCard = ({
  title,
  icon,
  total,
  counts,
  caption,
  permissions
}: {
  title: string
  icon: React.ReactNode
  total: number
  counts: Partial<Record<Status, number>>
  caption?: string
  permissions: string[]
}) => {
  const allowed = useAllowed(permissions)
  if (!allowed) return null

  return (
    <Card className="transition-colors hover:border-ring">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-semibold tabular-nums">
            {total}
          </span>
          {caption && (
            <span className="text-xs text-muted-foreground">{caption}</span>
          )}
        </div>
        <StatusTally counts={counts} />
      </CardContent>
    </Card>
  )
}
