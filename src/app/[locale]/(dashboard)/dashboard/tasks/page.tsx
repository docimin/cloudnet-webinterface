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
import Link from 'next/link'
import { serverTaskApi } from '@/lib/server-api'
import { getTranslations } from 'gt-next/server'

export default async function TasksPage() {
  const tasks = await serverTaskApi.list()
  const permissions = await getPermissions()
  const taskT = await getTranslations('Tasks')

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

  if (!tasks?.tasks || tasks.tasks.length === 0) {
    return <NoRecords />
  }

  return (
    <PageLayout title={taskT('title')}>
      <Table>
        <TableCaption>{taskT('tableCaption')}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">{taskT('name')}</TableHead>
            <TableHead>{taskT('maintenance')}</TableHead>
            <TableHead>{taskT('static')}</TableHead>
            {hasEditPermissions && (
              <TableHead className="sr-only">{taskT('edit')}</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.tasks
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((task) => (
              <TableRow key={task?.name}>
                <TableCell className="font-medium">{task?.name}</TableCell>
                <TableCell>
                  {task?.maintenance ? taskT('yes') : taskT('no')}
                </TableCell>
                <TableCell>
                  {task?.staticServices ? taskT('yes') : taskT('no')}
                </TableCell>
                {hasEditPermissions && (
                  <TableCell>
                    <Link href={`/dashboard/tasks/${task?.name}`}>
                      <Button
                        size={'sm'}
                        variant={'link'}
                        className={'p-0 text-right'}
                      >
                        {taskT('edit')}
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
