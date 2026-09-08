import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { z } from 'zod'
import AutoRefresh from '@/components/autoRefresh'
import PageHeader from '@/components/pageHeader'
import PageLayout from '@/components/pageLayout'
import NoAccess from '@/components/static/noAccess'
import TableEmpty from '@/components/tableEmpty'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { currentPermissions } from '@/server/auth'
import { playerOnline } from '@/server/player'

const requiredPermissions = [
  'cloudnet_bridge:player_read',
  'cloudnet_bridge:player_get_bulk',
  'global:admin'
]

const pageSizes = [25, 50, 100]

const serviceLabel = (service: NetworkService) =>
  `${service.serviceId.taskName}${service.serviceId.nameSplitter}${service.serviceId.taskServiceId}`

export const Route = createFileRoute('/{-$locale}/_authed/dashboard/players/')({
  validateSearch: z.object({
    limit: z.number().optional().catch(undefined),
    offset: z.number().optional().catch(undefined),
    sort: z.enum(['asc', 'desc']).optional().catch(undefined)
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const permissions = await currentPermissions()
    const hasPermissions = requiredPermissions.some((permission) =>
      permissions.includes(permission)
    )
    return {
      permissions,
      hasPermissions,
      onlinePlayers: hasPermissions ? await playerOnline({ data: deps }) : null
    }
  },
  component: PlayersPage
})

function PlayersPage() {
  const { hasPermissions, onlinePlayers } = Route.useLoaderData()
  const { limit, offset } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const playersT = useTranslations('Players')

  if (!hasPermissions) {
    return (
      <PageLayout title={playersT('title')}>
        <NoAccess />
      </PageLayout>
    )
  }

  const players = onlinePlayers?.onlinePlayers ?? []
  const start = offset ?? 0
  const canPrevious = start > 0
  const canNext = limit !== undefined && players.length === limit

  const changePageSize = (value: string) =>
    navigate({
      search: (prev) => ({
        ...prev,
        limit: value === 'all' ? undefined : Number(value),
        offset: undefined
      })
    })

  const goTo = (next: number) =>
    navigate({ search: (prev) => ({ ...prev, offset: next || undefined }) })

  const openPlayer = (playerId: string) =>
    navigate({
      to: '/{-$locale}/dashboard/players/$playerId',
      params: { playerId }
    })

  return (
    <PageLayout title={playersT('title')}>
      <AutoRefresh>
        <div className="flex flex-col gap-4">
          <PageHeader count={players.length} caption={playersT('tableCaption')}>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {playersT('perPage')}
              </span>
              <Select
                value={limit === undefined ? 'all' : String(limit)}
                onValueChange={changePageSize}
              >
                <SelectTrigger className="h-9 w-28 font-mono text-xs tabular-nums">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{playersT('all')}</SelectItem>
                  {pageSizes.map((size) => (
                    <SelectItem
                      key={size}
                      value={String(size)}
                      className="font-mono tabular-nums"
                    >
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </PageHeader>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-64">{playersT('name')}</TableHead>
                  <TableHead>{playersT('downstreamService')}</TableHead>
                  <TableHead>{playersT('proxyService')}</TableHead>
                  <TableHead className="text-right">
                    {playersT('proxyNode')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.length === 0 && (
                  <TableEmpty
                    colSpan={4}
                    title={playersT('noPlayersOnline')}
                    description={playersT('noPlayersOnlineDescription')}
                  />
                )}
                {players.map((player) => (
                  <TableRow
                    key={player.networkPlayerProxyInfo.uniqueId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      openPlayer(player.networkPlayerProxyInfo.uniqueId)
                    }
                  >
                    <TableCell className="font-mono font-medium">
                      <Link
                        to="/{-$locale}/dashboard/players/$playerId"
                        params={{
                          playerId: player.networkPlayerProxyInfo.uniqueId
                        }}
                        onClick={(event) => event.stopPropagation()}
                        className="hover:underline focus-visible:underline"
                      >
                        {player.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono">
                      {serviceLabel(player.connectedService)}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {serviceLabel(player.loginService)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {player.loginService.serviceId.nodeUniqueId}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-3">
            <Button
              variant={'outline'}
              size={'sm'}
              disabled={!canPrevious}
              onClick={() => goTo(Math.max(0, start - (limit ?? start)))}
            >
              {playersT('previous')}
            </Button>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {playersT('range', {
                from: players.length ? start + 1 : 0,
                to: start + players.length
              })}
            </span>
            <Button
              variant={'outline'}
              size={'sm'}
              disabled={!canNext}
              onClick={() => goTo(start + players.length)}
            >
              {playersT('next')}
            </Button>
          </div>
        </div>
      </AutoRefresh>
    </PageLayout>
  )
}
