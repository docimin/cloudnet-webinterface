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
import CreateGroup from '@/components/modules/groups/createGroup'
import Link from 'next/link'
import { serverGroupApi } from '@/lib/server-api'
import { getDict } from 'gt-next/server'

export default async function GroupsPage() {
  const groupsT = await getDict('Groups')
  const mainT = await getDict('Main')

  const groups = await serverGroupApi.list()
  const permissions: string[] = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:group_read',
    'cloudnet_rest:group_list',
    'global:admin'
  ]

  const requiredEditPermissions = [
    'cloudnet_rest:group_read',
    'cloudnet_rest:group_get',
    'global:admin'
  ]

  // check if user has required permissions
  const hasPermissions = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )
  const hasEditPermissions = requiredEditPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!groups.groups) {
    return <NoRecords />
  }

  return (
    <PageLayout title={groupsT('title')}>
      <CreateGroup />
      <Table className={'mt-4'}>
        <TableCaption>{groupsT('tableCaption')}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-full">{groupsT('name')}</TableHead>
            {hasEditPermissions && (
              <TableHead className="sr-only">{mainT('edit')}</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.groups
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((group) => (
              <TableRow key={group.name}>
                <TableCell className="font-medium">{group.name}</TableCell>
                {hasEditPermissions && (
                  <TableCell>
                    <Link href={`/dashboard/groups/${group.name}`}>
                      <Button
                        size={'sm'}
                        variant={'link'}
                        className={'p-0 text-right'}
                      >
                        {mainT('edit')}
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
