import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import CreateGroup from '@/components/modules/groups/createGroup'
import PageHeader from '@/components/pageHeader'
import PageLayout from '@/components/pageLayout'
import NoAccess from '@/components/static/noAccess'
import NoRecords from '@/components/static/noRecords'
import TableEmpty from '@/components/tableEmpty'
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
import { groupList } from '@/server/group'

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

export const Route = createFileRoute('/{-$locale}/_authed/dashboard/groups/')({
  loader: async () => {
    const permissions = await currentPermissions()
    const hasPermissions = requiredPermissions.some((permission) =>
      permissions.includes(permission)
    )
    return {
      permissions,
      hasPermissions,
      groups: hasPermissions ? await groupList() : null
    }
  },
  component: GroupsPage
})

function GroupsPage() {
  const { permissions, hasPermissions, groups } = Route.useLoaderData()
  const groupsT = useTranslations('Groups')
  const statusT = useTranslations('Status')
  const navigate = useNavigate()

  const hasEditPermissions = requiredEditPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!groups?.groups) {
    return <NoRecords />
  }

  const sorted = [...groups.groups]
    .filter((group) => Boolean(group?.name))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <PageLayout title={groupsT('title')}>
      <div className="flex flex-col gap-4">
        <PageHeader count={sorted.length} caption={groupsT('tableCaption')}>
          <CreateGroup />
        </PageHeader>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-full">{groupsT('name')}</TableHead>
                <TableHead className="text-right">
                  {groupsT('templates')}
                </TableHead>
                <TableHead className="text-right">
                  {groupsT('deployments')}
                </TableHead>
                <TableHead className="text-right">
                  {groupsT('includes')}
                </TableHead>
                <TableHead>{groupsT('environments')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 && (
                <TableEmpty
                  colSpan={5}
                  title={groupsT('noGroups')}
                  description={groupsT('noGroupsDescription')}
                />
              )}
              {sorted.map((group) => (
                <TableRow
                  key={group.name}
                  className={cn(
                    'hover:bg-muted/50',
                    hasEditPermissions && 'cursor-pointer'
                  )}
                  onClick={
                    hasEditPermissions
                      ? () =>
                          navigate({
                            to: '/{-$locale}/dashboard/groups/$groupId',
                            params: { groupId: group.name }
                          })
                      : undefined
                  }
                >
                  <TableCell className="font-mono font-medium">
                    {hasEditPermissions ? (
                      <Link
                        to="/{-$locale}/dashboard/groups/$groupId"
                        params={{ groupId: group.name }}
                        onClick={(event) => event.stopPropagation()}
                        className="hover:underline focus-visible:underline"
                      >
                        {group.name}
                      </Link>
                    ) : (
                      group.name
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {group.templates?.length ?? 0}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {group.deployments?.length ?? 0}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {group.includes?.length ?? 0}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {group.targetEnvironments?.length ? (
                      <span className="font-mono text-xs">
                        {group.targetEnvironments.join(', ')}
                      </span>
                    ) : (
                      <span className="text-xs">{statusT('none')}</span>
                    )}
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
