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
import { getNodes } from '@/utils/server-api/nodes/getNodes'
import { NodesType } from '@/utils/types/nodes'
import { Button } from '@/components/ui/button'
import { getPermissions } from '@/utils/server-api/user/getPermissions'
import Link from 'next/link'
import NoAccess from '@/components/static/noAccess'
import Maintenance from '@/components/static/maintenance'
import { getGroups } from '@/utils/server-api/groups/getGroups'

export const runtime = 'edge'

export default async function GroupsPage({ params: { lang } }) {
  const groups: GroupsType = await getGroups()
  const permissions: string[] = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:group_read',
    'cloudnet_rest:group_list',
    'global:admin',
  ]

  const requiredEditPermissions = [
    'cloudnet_rest:group_read',
    'cloudnet_rest:group_get',
    'global:admin',
  ]

  // check if user has required permissions
  const hasPermissions = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!groups.groups) {
    return <Maintenance />
  }

  return (
    <PageLayout title={'Groups'}>
      <Table>
        <TableCaption>A list of your groups.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-full">Name</TableHead>
            {requiredPermissions.some((permission) =>
              permissions.includes(permission)
            ) && <TableHead className="sr-only">Edit</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.groups
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((group) => (
              <TableRow key={group.name}>
                <TableCell className="font-medium">{group.name}</TableCell>
                {requiredEditPermissions.some((permission) =>
                  permissions.includes(permission)
                ) && (
                  <TableCell>
                    <Link href={`/${lang}/dashboard/groups/${group.name}`}>
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
