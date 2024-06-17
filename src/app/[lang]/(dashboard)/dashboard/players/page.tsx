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
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getPermissions } from '@/utils/server-api/user/getPermissions'
import NoAccess from '@/components/static/noAccess'
import { getListOnlinePlayers } from '@/utils/server-api/players/getListOnlinePlayers'
import NoRecords from '@/components/static/noRecords'

export const runtime = 'edge'

export default async function PlayersPage({ params: { lang } }) {
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
    return <NoAccess />
  }

  if (onlinePlayers.onlinePlayers.length === 0) {
    return <NoRecords />
  }

  return (
    <PageLayout title={'Players'}>
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
                    href={`/${lang}/dashboard/players/${player?.networkPlayerProxyInfo.uniqueId}`}
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
    </PageLayout>
  )
}
