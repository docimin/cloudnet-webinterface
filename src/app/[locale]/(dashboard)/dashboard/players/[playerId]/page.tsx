import PageLayout from '@/components/pageLayout'
import { getPermissions } from '@/utils/server-api/user/getPermissions'
import NoAccess from '@/components/static/noAccess'
import DoesNotExist from '@/components/static/doesNotExist'
import {
  CalendarIcon,
  CaseLowerIcon,
  HistoryIcon,
  ServerIcon,
} from 'lucide-react'
import { DashboardCard } from '@/components/dashboardCard'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/components/formatDate'
import SendToService from '@/components/modules/players/sendToService'
import KickPlayer from '@/components/modules/players/kickPlayer'
import SendChatMessage from '@/components/modules/players/sendChatMessage'
import ExecuteCommand from '@/components/modules/players/executeCommand'
import { serverPlayerApi } from '@/lib/server-api'

export const runtime = 'edge'

export default async function UserPage(props) {
  const params = await props.params

  const { playerId } = params

  const permissions = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:player_read',
    'cloudnet_rest:player_get',
    'global:admin',
  ]

  // check if user has required permissions
  const hasPermissions = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  let player: OnlinePlayer | null = null
  try {
    player = await serverPlayerApi.get(playerId)
  } catch {
    return <DoesNotExist name={'Player'} />
  }

  return (
    <PageLayout title={`Edit ${player.name}`}>
      <div className={'flex items-center justify-between'}>
        <div className={'flex gap-4'}>
          <SendToService player={player} />
          <SendChatMessage player={player} />
          <ExecuteCommand player={player} />
        </div>

        <KickPlayer player={player} />
      </div>
      <div className="flex flex-1 flex-col gap-4 md:gap-8 mt-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <DashboardCard
            title="Name"
            icon={<CaseLowerIcon className="w-4 h-4" />}
            value={player.name}
            permissions={[
              'cloudnet_bridge:player_read',
              'cloudnet_bridge:player_get',
              'global:admin',
            ]}
          />
          <DashboardCard
            title="First time login"
            icon={<CaseLowerIcon className="w-4 h-4" />}
            value={formatDate(new Date(player.firstLoginTimeMillis))}
            permissions={[
              'cloudnet_bridge:player_read',
              'cloudnet_bridge:player_get',
              'global:admin',
            ]}
          />
          <DashboardCard
            title="Last time login"
            icon={<CaseLowerIcon className="w-4 h-4" />}
            value={formatDate(new Date(player.lastLoginTimeMillis))}
            permissions={[
              'cloudnet_bridge:player_read',
              'cloudnet_bridge:player_get',
              'global:admin',
            ]}
          />
          <DashboardCard
            title="Last server"
            icon={<ServerIcon className="w-4 h-4" />}
            value={
              player.connectedService.serviceId.taskName +
              player.connectedService.serviceId.nameSplitter +
              player.connectedService.serviceId.taskServiceId
            }
            permissions={[
              'cloudnet_bridge:player_read',
              'cloudnet_bridge:player_get',
              'global:admin',
            ]}
          />
          <DashboardCard
            title="Last Node"
            icon={<ServerIcon className="w-4 h-4" />}
            value={player.connectedService.serviceId.nodeUniqueId}
            permissions={[
              'cloudnet_bridge:player_read',
              'cloudnet_bridge:player_get',
              'global:admin',
            ]}
          />
        </div>
      </div>
      {player?.properties?.labyModOptions && (
        <>
          <Separator className={'my-8'} />
          <div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <DashboardCard
                title="Labymod version"
                icon={<HistoryIcon className="w-4 h-4" />}
                value={player?.properties?.labyModOptions?.version || 'Unknown'}
                permissions={[
                  'cloudnet_bridge:player_read',
                  'cloudnet_bridge:player_get',
                  'global:admin',
                ]}
              />
              <DashboardCard
                title="Labymod creation date"
                icon={<CalendarIcon className="w-4 h-4" />}
                value={
                  formatDate(
                    new Date(player?.properties?.labyModOptions?.creationTime)
                  ) || 'Unknown'
                }
                permissions={[
                  'cloudnet_bridge:player_read',
                  'cloudnet_bridge:player_get',
                  'global:admin',
                ]}
              />
            </div>
          </div>
        </>
      )}
    </PageLayout>
  )
}
