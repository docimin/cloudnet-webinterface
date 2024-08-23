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
import NoRecords from '@/components/static/noRecords'
import { getTasks } from '@/utils/server-api/tasks/getTasks'
import { Link } from '@/navigation'

export const runtime = 'edge'

export default async function TasksPage({ params: { locale } }) {
  const tasks: TasksType = await getTasks()
  const permissions: string[] = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:user_read',
    'cloudnet_rest:user_get_all',
    'global:admin',
  ]

  const requiredEditPermissions = [
    'cloudnet_rest:task_read',
    'cloudnet_rest:task_get',
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

  if (tasks.tasks.length === 0) {
    return <NoRecords />
  }

  return (
    <PageLayout title={'Tasks'}>
      <Table>
        <TableCaption>A list of your tasks.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Name</TableHead>
            <TableHead>Maintenance</TableHead>
            <TableHead>Static</TableHead>
            {hasEditPermissions && (
              <TableHead className="sr-only">Edit</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks?.tasks
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((task) => (
              <TableRow key={task?.name}>
                <TableCell className="font-medium">{task?.name}</TableCell>
                <TableCell>{task?.maintenance ? 'True' : 'False'}</TableCell>
                <TableCell>{task?.staticServices ? 'True' : 'False'}</TableCell>
                {hasEditPermissions && (
                  <TableCell>
                    <Link
                      href={{
                        pathname: '/dashboard/tasks/[taskId]',
                        params: { taskId: task?.name },
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
