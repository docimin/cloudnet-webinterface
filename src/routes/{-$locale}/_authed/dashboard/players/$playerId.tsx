import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import {
  CalendarIcon,
  HistoryIcon,
  ServerIcon,
  WorkflowIcon
} from 'lucide-react'
import { DashboardCard } from '@/components/dashboardCard'
import { formatDate } from '@/components/formatDate'
import ExecuteCommand from '@/components/modules/players/executeCommand'
import KickPlayer from '@/components/modules/players/kickPlayer'
import SendChatMessage from '@/components/modules/players/sendChatMessage'
import SendToService from '@/components/modules/players/sendToService'
import PageLayout from '@/components/pageLayout'
import DoesNotExist from '@/components/static/doesNotExist'
import NoAccess from '@/components/static/noAccess'
import { currentPermissions } from '@/server/auth'
import { playerGet } from '@/server/player'

const requiredPermissions = [
  'cloudnet_bridge:player_read',
  'cloudnet_bridge:player_get',
  'global:admin'
]

export const Route = createFileRoute(
  '/{-$locale}/_authed/dashboard/players/$playerId'
)({
  loader: async ({ params }) => {
    const permissions = await currentPermissions()
    const hasPermissions = requiredPermissions.some((permission) =>
      permissions.includes(permission)
    )

    if (!hasPermissions) {
      return { hasPermissions, player: null }
    }

    let player: OnlinePlayer | null = null
    try {
      player = await playerGet({ data: { id: params.playerId } })
    } catch {
      return { hasPermissions, player: null }
    }

    return { hasPermissions, player }
  },
  component: UserPage
})

function UserPage() {
  const { hasPermissions, player } = Route.useLoaderData()
  const playersT = useTranslations('Players')

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!player) {
    return <DoesNotExist name={playersT('name')} />
  }

  const labyMod = player?.properties?.labyModOptions

  return (
    <PageLayout title={playersT('editTitle', { playerName: player.name })}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="font-mono text-lg font-semibold">{player.name}</div>
            <p className="font-mono text-xs text-muted-foreground">
              {player.networkPlayerProxyInfo.uniqueId}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SendToService player={player} />
            <SendChatMessage player={player} />
            <ExecuteCommand player={player} />
            <KickPlayer player={player} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <DashboardCard
            title={playersT('lastServer')}
            icon={<ServerIcon className="size-4" />}
            value={
              player.connectedService.serviceId.taskName +
              player.connectedService.serviceId.nameSplitter +
              player.connectedService.serviceId.taskServiceId
            }
            permissions={[
              'cloudnet_bridge:player_read',
              'cloudnet_bridge:player_get',
              'global:admin'
            ]}
          />
          <DashboardCard
            title={playersT('lastNode')}
            icon={<WorkflowIcon className="size-4" />}
            value={player.connectedService.serviceId.nodeUniqueId}
            permissions={[
              'cloudnet_bridge:player_read',
              'cloudnet_bridge:player_get',
              'global:admin'
            ]}
          />
          <DashboardCard
            title={playersT('firstLogin')}
            icon={<CalendarIcon className="size-4" />}
            value={formatDate(new Date(player.firstLoginTimeMillis))}
            permissions={[
              'cloudnet_bridge:player_read',
              'cloudnet_bridge:player_get',
              'global:admin'
            ]}
          />
          <DashboardCard
            title={playersT('lastLogin')}
            icon={<HistoryIcon className="size-4" />}
            value={formatDate(new Date(player.lastLoginTimeMillis))}
            permissions={[
              'cloudnet_bridge:player_read',
              'cloudnet_bridge:player_get',
              'global:admin'
            ]}
          />
        </div>

        {labyMod && (
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-medium text-muted-foreground">
              {playersT('labymod')}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <DashboardCard
                title={playersT('labymodVersion')}
                icon={<HistoryIcon className="size-4" />}
                value={labyMod.version || playersT('unknown')}
                permissions={[
                  'cloudnet_bridge:player_read',
                  'cloudnet_bridge:player_get',
                  'global:admin'
                ]}
              />
              <DashboardCard
                title={playersT('labymodCreationDate')}
                icon={<CalendarIcon className="size-4" />}
                value={
                  formatDate(new Date(labyMod.creationTime)) ||
                  playersT('unknown')
                }
                permissions={[
                  'cloudnet_bridge:player_read',
                  'cloudnet_bridge:player_get',
                  'global:admin'
                ]}
              />
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
