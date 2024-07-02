import PageLayout from '@/components/pageLayout'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { getPermissions } from '@/utils/server-api/user/getPermissions'
import NoAccess from '@/components/static/noAccess'
import { getListOnlinePlayers } from '@/utils/server-api/players/getListOnlinePlayers'
import NoRecords from '@/components/static/noRecords'
import { Link } from '@/navigation'
import AutoRefresh from '@/components/autoRefresh'

export const runtime = 'edge'

export default async function PlayersPage({ params: { locale } }) {
  const onlinePlayers: OnlinePlayersSchema = await getListOnlinePlayers(0)
  const permissions: string[] = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:user_read',
    'cloudnet_rest:user_get_all',
    'global:admin',
  ]

  // check if user has required permissions
  const hasPermissions = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return (
      <PageLayout title={'Players'}>
        <NoAccess />
      </PageLayout>
    )
  }

  if (onlinePlayers.onlinePlayers.length === 0) {
    return (
      <PageLayout title={'Players'}>
        <AutoRefresh>
          <NoRecords />
        </AutoRefresh>
      </PageLayout>
    )
  }

  return (
    <PageLayout title={'Players'}>
      <AutoRefresh>
        <Table>
          <TableCaption>A list of your online players.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Name</TableHead>
              <TableHead>Last location</TableHead>
              <TableHead>Node</TableHead>
              {requiredPermissions.some((permission) =>
                permissions.includes(permission)
              ) && <TableHead className="sr-only">Edit</TableHead>}
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
                  {player?.connectedService.serviceId.nodeUniqueId}
                </TableCell>
                {requiredPermissions.some((permission) =>
                  permissions.includes(permission)
                ) && (
                  <TableCell>
                    <Link
                      href={{
                        pathname: '/dashboard/players/[playerId]',
                        params: {
                          playerId: player?.networkPlayerProxyInfo.uniqueId,
                        },
                      }}
                    >
                      <Button
                        size={'sm'}
                        variant={'link'}
                        className={'p-0 text-right'}
                      >
                        Edit
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
