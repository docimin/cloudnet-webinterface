import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { formatDate } from '@/components/formatDate'
import CreateUser from '@/components/modules/users/createUser'
import PageHeader from '@/components/pageHeader'
import PageLayout from '@/components/pageLayout'
import NoAccess from '@/components/static/noAccess'
import NoRecords from '@/components/static/noRecords'
import TableEmpty from '@/components/tableEmpty'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { currentPermissions } from '@/server/auth'
import { userList } from '@/server/user'

const requiredPermissions = [
  'cloudnet_rest:user_read',
  'cloudnet_rest:user_get_all',
  'global:admin'
]

export const Route = createFileRoute('/{-$locale}/_authed/dashboard/users/')({
  loader: async () => {
    const permissions = await currentPermissions()
    const hasPermissions = requiredPermissions.some((permission) =>
      permissions.includes(permission)
    )
    return {
      permissions,
      hasPermissions,
      users: hasPermissions ? await userList() : null
    }
  },
  component: UsersPage
})

function UsersPage() {
  const { permissions, hasPermissions, users } = Route.useLoaderData()
  const usersT = useTranslations('Users')
  const navigate = useNavigate()

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!users?.users) {
    return <NoRecords />
  }

  const canEdit = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )
  const rows = [...users.users]
    .filter((user) => Boolean(user?.username))
    .sort((a, b) => a.username.localeCompare(b.username))

  return (
    <PageLayout title={usersT('title')}>
      <div className="flex flex-col gap-4">
        <PageHeader count={rows.length} caption={usersT('tableCaption')}>
          <CreateUser />
        </PageHeader>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{usersT('name')}</TableHead>
                <TableHead className="text-right">{usersT('scopes')}</TableHead>
                <TableHead>{usersT('createdAt')}</TableHead>
                <TableHead>{usersT('modifiedAt')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableEmpty
                  colSpan={4}
                  title={usersT('empty')}
                  description={usersT('emptyDescription')}
                />
              )}
              {rows.map((user) => (
                <TableRow
                  key={user.id}
                  className={cn(
                    'hover:bg-muted/50',
                    canEdit && 'cursor-pointer'
                  )}
                  onClick={
                    canEdit
                      ? () =>
                          navigate({
                            to: '/{-$locale}/dashboard/users/$userId',
                            params: { userId: user.id }
                          })
                      : undefined
                  }
                >
                  <TableCell className="font-mono font-medium">
                    {canEdit ? (
                      <Link
                        to="/{-$locale}/dashboard/users/$userId"
                        params={{ userId: user.id }}
                        onClick={(event) => event.stopPropagation()}
                        className="hover:underline focus-visible:underline"
                      >
                        {user.username}
                      </Link>
                    ) : (
                      user.username
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-2">
                      {user.scopes?.includes('global:admin') && (
                        <Badge variant="secondary" className="font-normal">
                          {usersT('admin')}
                        </Badge>
                      )}
                      <span className="font-mono tabular-nums">
                        {user.scopes?.length ?? 0}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="font-mono tabular-nums text-muted-foreground">
                    {user.createdAt
                      ? formatDate(new Date(user.createdAt))
                      : '—'}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums text-muted-foreground">
                    {user.modifiedAt
                      ? formatDate(new Date(user.modifiedAt))
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageLayout>
  )
}
