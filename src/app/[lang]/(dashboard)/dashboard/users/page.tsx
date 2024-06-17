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
import Link from 'next/link'
import NoAccess from '@/components/static/noAccess'
import { getUsers } from '@/utils/server-api/users/getUsers'
import { Users } from '@/utils/types/users'
import { formatDate } from '@/components/formatDate'
import NoRecords from '@/components/static/noRecords'

export const runtime = 'edge'

export default async function UsersPage({ params: { lang } }) {
  const users: Users = await getUsers()
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

  if (!users.users) {
    return <NoRecords />
  }

  return (
    <PageLayout title={'Users'}>
      <Table>
        <TableCaption>A list of your users.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Created at</TableHead>
            <TableHead>Modified at</TableHead>
            {requiredPermissions.some((permission) =>
              permissions.includes(permission)
            ) && <TableHead className="sr-only">Edit</TableHead>}
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
                    <Link href={`/${lang}/dashboard/users/${user.id}`}>
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
