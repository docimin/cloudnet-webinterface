import PageLayout from '@/components/pageLayout'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { getPermissions } from '@/utils/server-api/getPermissions'
import NoAccess from '@/components/static/noAccess'
import NoRecords from '@/components/static/noRecords'
import Link from 'next/link'
import AutoRefresh from '@/components/autoRefresh'
import { serverPlayerApi } from '@/lib/server-api'
import { getTranslations } from 'gt-next/server'

export default async function PlayersPage() {
  const playersT = await getTranslations('Players')
  const onlinePlayers = await serverPlayerApi.online()
  const permissions = await getPermissions()
  const requiredPermissions = [
    'cloudnet_bridge:player_read',
    'cloudnet_bridge:player_online_count',
    'global:admin'
  ]

  // check if user has required permissions
  const hasPermissions = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return (
      <PageLayout title={playersT('title')}>
        <NoAccess />
      </PageLayout>
    )
  }

  if (onlinePlayers?.onlinePlayers?.length === 0) {
    return (
      <PageLayout title={playersT('title')}>
        <AutoRefresh>
          <NoRecords />
        </AutoRefresh>
      </PageLayout>
    )
  }

  return (
    <PageLayout title={playersT('title')}>
      <AutoRefresh>
        <Table>
          <TableCaption>{playersT('tableCaption')}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">{playersT('name')}</TableHead>
              <TableHead>{playersT('downstreamService')}</TableHead>
              <TableHead>{playersT('proxyService')}</TableHead>
              <TableHead>{playersT('proxyNode')}</TableHead>
              {requiredPermissions.some((permission) =>
                permissions.includes(permission)
              ) && (
                <TableHead className="sr-only">{playersT('details')}</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {onlinePlayers?.onlinePlayers.map((player) => (
              <TableRow key={player?.networkPlayerProxyInfo.uniqueId}>
                <TableCell className="font-medium">{player?.name}</TableCell>
                <TableCell>
                  {player?.connectedService.serviceId.taskName +
                    player?.connectedService.serviceId.nameSplitter +
                    player?.connectedService.serviceId.taskServiceId}
                </TableCell>
                <TableCell>
                  {player?.loginService.serviceId.taskName +
                    player?.loginService.serviceId.nameSplitter +
                    player?.loginService.serviceId.taskServiceId}
                </TableCell>
                <TableCell>
                  {player?.loginService.serviceId.nodeUniqueId}
                </TableCell>
                {requiredPermissions.some((permission) =>
                  permissions.includes(permission)
                ) && (
                  <TableCell>
                    <Link
                      href={`/dashboard/players/${player?.networkPlayerProxyInfo.uniqueId}`}
                    >
                      <Button
                        size={'sm'}
                        variant={'link'}
                        className={'p-0 text-right'}
                      >
                        {playersT('details')}
                      </Button>
                    </Link>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AutoRefresh>
    </PageLayout>
  )
}
