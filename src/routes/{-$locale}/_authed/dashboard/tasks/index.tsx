import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import BlueprintDialog from '@/components/blueprint/blueprintDialog'
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
import { taskList } from '@/server/task'

const requiredPermissions = [
  'cloudnet_rest:task_read',
  'cloudnet_rest:task_list',
  'global:admin'
]

const requiredEditPermissions = [
  'cloudnet_rest:task_read',
  'cloudnet_rest:task_get',
  'global:admin'
]

const requiredCreatePermissions = [
  'cloudnet_rest:task_write',
  'cloudnet_rest:task_create',
  'global:admin'
]

export const Route = createFileRoute('/{-$locale}/_authed/dashboard/tasks/')({
  loader: async () => {
    const permissions = await currentPermissions()
    const hasPermissions = requiredPermissions.some((permission) =>
      permissions.includes(permission)
    )
    return {
      permissions,
      hasPermissions,
      tasks: hasPermissions ? await taskList() : null
    }
  },
  component: TasksPage
})

function TasksPage() {
  const { permissions, hasPermissions, tasks } = Route.useLoaderData()
  const taskT = useTranslations('Tasks')
  const navigate = useNavigate()

  const hasEditPermissions = requiredEditPermissions.some((permission) =>
    permissions.includes(permission)
  )
  const hasCreatePermissions = requiredCreatePermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!tasks?.tasks) {
    return <NoRecords />
  }

  const rows = [...tasks.tasks]
    .filter((task) => Boolean(task?.name))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <PageLayout title={taskT('title')}>
      <div className="flex flex-col gap-4">
        <PageHeader count={rows.length} caption={taskT('tableCaption')}>
          {hasCreatePermissions && <BlueprintDialog />}
        </PageHeader>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-64">{taskT('name')}</TableHead>
                <TableHead>{taskT('environment')}</TableHead>
                <TableHead className="text-right">
                  {taskT('minServiceCount')}
                </TableHead>
                <TableHead className="text-right">
                  {taskT('startPort')}
                </TableHead>
                <TableHead className="text-right">
                  {taskT('maxMemory')}
                </TableHead>
                <TableHead>{taskT('maintenance')}</TableHead>
                <TableHead>{taskT('static')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableEmpty
                  colSpan={7}
                  title={taskT('noTasks')}
                  description={taskT('noTasksDescription')}
                />
              )}
              {rows.map((task) => (
                <TableRow
                  key={task?.name}
                  className={cn(
                    'hover:bg-muted/50',
                    hasEditPermissions && 'cursor-pointer'
                  )}
                  onClick={
                    hasEditPermissions
                      ? () =>
                          navigate({
                            to: '/{-$locale}/dashboard/tasks/$taskId',
                            params: { taskId: task?.name }
                          })
                      : undefined
                  }
                >
                  <TableCell className="font-mono font-medium">
                    {hasEditPermissions ? (
                      <Link
                        to="/{-$locale}/dashboard/tasks/$taskId"
                        params={{ taskId: task?.name }}
                        onClick={(event) => event.stopPropagation()}
                        className="hover:underline focus-visible:underline"
                      >
                        {task?.name}
                      </Link>
                    ) : (
                      task?.name
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {task?.processConfiguration?.environment}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {task?.minServiceCount}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {task?.startPort}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {task?.processConfiguration?.maxHeapMemorySize} MB
                  </TableCell>
                  <TableCell
                    className={cn(
                      !task?.maintenance && 'text-muted-foreground'
                    )}
                  >
                    {task?.maintenance ? taskT('yes') : taskT('no')}
                  </TableCell>
                  <TableCell
                    className={cn(
                      !task?.staticServices && 'text-muted-foreground'
                    )}
                  >
                    {task?.staticServices ? taskT('yes') : taskT('no')}
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
