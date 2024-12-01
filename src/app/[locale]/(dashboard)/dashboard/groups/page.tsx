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
import { getGroups } from '@/utils/server-api/groups/getGroups'
import NoRecords from '@/components/static/noRecords'
import CreateGroup from '@/components/modules/groups/createGroup'
import { Link } from '@/i18n/routing'

export const runtime = 'edge'

export default async function GroupsPage(props) {
  const params = await props.params

  const { locale } = params

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
    <PageLayout title={'Groups'}>
      <CreateGroup />
      <Table className={'mt-4'}>
        <TableCaption>A list of your groups.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-full">Name</TableHead>
            {hasEditPermissions && (
              <TableHead className="sr-only">Edit</TableHead>
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
                    <Link
                      href={{
                        pathname: '/dashboard/groups/[groupId]',
                        params: { groupId: group.name },
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
    </PageLayout>
  )
}
