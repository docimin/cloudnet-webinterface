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
import { formatDate } from '@/components/formatDate'
import NoRecords from '@/components/static/noRecords'
import Link from 'next/link'
import { serverUserApi } from '@/lib/server-api'
import CreateUser from '@/components/modules/users/createUser'
import { getDict } from 'gt-next/server'

export default async function UsersPage() {
  const usersT = await getDict('Users')
  const mainT = await getDict('Main')

  const users: Users = await serverUserApi.list()
  const permissions = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:user_read',
    'cloudnet_rest:user_get_all',
    'global:admin'
  ]

  // check if user has required permissions
  const hasPermissions = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!users.users) {
    return <NoRecords />
  }

  return (
    <PageLayout title={usersT('title')}>
      <CreateUser />
      <Table>
        <TableCaption>{usersT('tableCaption')}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">{usersT('name')}</TableHead>
            <TableHead>{usersT('createdAt')}</TableHead>
            <TableHead>{usersT('modifiedAt')}</TableHead>
            {requiredPermissions.some((permission) =>
              permissions.includes(permission)
            ) && <TableHead className="sr-only">{mainT('edit')}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.users
            .sort((a, b) => a.username.localeCompare(b.username))
            .map((user) => (
              <TableRow key={user?.id}>
                <TableCell className="font-medium">{user?.username}</TableCell>
                <TableCell>{formatDate(new Date(user?.createdAt))}</TableCell>
                <TableCell>{formatDate(new Date(user?.modifiedAt))}</TableCell>
                {requiredPermissions.some((permission) =>
                  permissions.includes(permission)
                ) && (
                    <TableCell>
                      <Link href={`/dashboard/users/${user.id}`}>
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
