import PageLayout from '@/components/pageLayout'
import { getPermissions } from '@/utils/server-api/getPermissions'
import NoAccess from '@/components/static/noAccess'
import DoesNotExist from '@/components/static/doesNotExist'
import {
  CalendarIcon,
  CaseLowerIcon,
  HistoryIcon,
  ServerIcon
} from 'lucide-react'
import { DashboardCard } from '@/components/dashboardCard'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/components/formatDate'
import SendToService from '@/components/modules/players/sendToService'
import KickPlayer from '@/components/modules/players/kickPlayer'
import SendChatMessage from '@/components/modules/players/sendChatMessage'
import ExecuteCommand from '@/components/modules/players/executeCommand'
import { serverPlayerApi } from '@/lib/server-api'
import { getDict } from 'gt-next/server'

export default async function UserPage(props) {
  const params = await props.params
  const { playerId } = params
  const playersT = await getDict('Players')

  const permissions = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:player_read',
    'cloudnet_rest:player_get',
    'global:admin'
  ]

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
    return <DoesNotExist name={playersT('name')} />
  }

  return (
    <PageLayout
      title={playersT('editTitle', { variables: { playerName: player.name } })}
    >
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
            title={playersT('name')}
            icon={<CaseLowerIcon className="w-4 h-4" />}
            value={player.name}
            permissions={[
              'cloudnet_bridge:player_read',
              'cloudnet_bridge:player_get',
              'global:admin'
            ]}
          />
          <DashboardCard
            title={playersT('firstLogin')}
            icon={<CaseLowerIcon className="w-4 h-4" />}
            value={formatDate(new Date(player.firstLoginTimeMillis))}
            permissions={[
              'cloudnet_bridge:player_read',
              'cloudnet_bridge:player_get',
              'global:admin'
            ]}
          />
          <DashboardCard
            title={playersT('lastLogin')}
            icon={<CaseLowerIcon className="w-4 h-4" />}
            value={formatDate(new Date(player.lastLoginTimeMillis))}
            permissions={[
              'cloudnet_bridge:player_read',
              'cloudnet_bridge:player_get',
              'global:admin'
            ]}
          />
          <DashboardCard
            title={playersT('lastServer')}
            icon={<ServerIcon className="w-4 h-4" />}
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
            icon={<ServerIcon className="w-4 h-4" />}
            value={player.connectedService.serviceId.nodeUniqueId}
            permissions={[
              'cloudnet_bridge:player_read',
              'cloudnet_bridge:player_get',
              'global:admin'
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
                title={playersT('labymodVersion')}
                icon={<HistoryIcon className="w-4 h-4" />}
                value={
                  player?.properties?.labyModOptions?.version ||
                  playersT('unknown')
                }
                permissions={[
                  'cloudnet_bridge:player_read',
                  'cloudnet_bridge:player_get',
                  'global:admin'
                ]}
              />
              <DashboardCard
                title={playersT('labymodCreationDate')}
                icon={<CalendarIcon className="w-4 h-4" />}
                value={
                  formatDate(
                    new Date(player?.properties?.labyModOptions?.creationTime)
                  ) || playersT('unknown')
                }
                permissions={[
                  'cloudnet_bridge:player_read',
                  'cloudnet_bridge:player_get',
                  'global:admin'
                ]}
              />
            </div>
          </div>
        </>
      )}
    </PageLayout>
  )
}
