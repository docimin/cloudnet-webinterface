import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { ChevronLeftIcon, TerminalIcon } from 'lucide-react'
import DetailField from '@/components/detailField'
import TaskFormEditor from '@/components/editors/taskFormEditor'
import PageLayout from '@/components/pageLayout'
import DoesNotExist from '@/components/static/doesNotExist'
import NoAccess from '@/components/static/noAccess'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { currentPermissions } from '@/server/auth'
import { serviceEnvironmentList } from '@/server/serviceVersion'
import { taskDelete, taskGet } from '@/server/task'
import type { ServiceEnvironmentType } from '@/utils/types/serviceVersions'
import type { Task } from '@/utils/types/tasks'

const requiredPermissions = [
  'cloudnet_rest:task_read',
  'cloudnet_rest:task_get',
  'global:admin'
]

const requiredEditPermissions = [
  'cloudnet_rest:task_write',
  'cloudnet_rest:task_create',
  'global:admin'
]

const requiredDeletePermissions = [
  'cloudnet_rest:task_write',
  'cloudnet_rest:task_delete',
  'global:admin'
]

export const Route = createFileRoute(
  '/{-$locale}/_authed/dashboard/tasks/$taskId'
)({
  loader: async ({ params }) => {
    const permissions = await currentPermissions()
    const hasPermissions = requiredPermissions.some((permission) =>
      permissions.includes(permission)
    )

    if (!hasPermissions) {
      return {
        permissions,
        hasPermissions,
        task: null,
        taskExists: false,
        environments: []
      }
    }

    // the environment list needs its own scopes, so the editor falls back to the
    // value the task already carries rather than failing the whole route
    const environments = await serviceEnvironmentList()
      .then((payload) => payload.environments)
      .catch(() => [] as ServiceEnvironmentType[])

    try {
      const task = await taskGet({ data: { id: params.taskId } })
      return {
        permissions,
        hasPermissions,
        task,
        taskExists: true,
        environments
      }
    } catch {
      return {
        permissions,
        hasPermissions,
        task: null,
        taskExists: false,
        environments
      }
    }
  },
  component: TaskPage
})

function DeleteButton({ taskId }: { taskId: string }) {
  const navigate = useNavigate()
  const taskT = useTranslations('Tasks')

  const handleDelete = async () => {
    await taskDelete({ data: { id: taskId } })
    navigate({ to: '/{-$locale}/dashboard/tasks' })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={'destructive'} size={'sm'}>
          {taskT('deleteTask')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{taskT('deleteConfirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {taskT('deleteConfirmDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{taskT('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            {taskT('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function TaskClientPage({
  task,
  taskId,
  hasEditPermissions,
  hasDeletePermissions,
  environments
}: {
  task: Task
  taskId: string
  hasEditPermissions: boolean
  hasDeletePermissions: boolean
  environments: ServiceEnvironmentType[]
}) {
  const taskT = useTranslations('Tasks')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Link
            to="/{-$locale}/dashboard/tasks"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeftIcon className="size-3" />
            {taskT('backToTasks')}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-lg font-semibold">
              {task?.name}
            </span>
            {task?.maintenance && (
              <Badge variant={'secondary'}>{taskT('maintenance')}</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasDeletePermissions && <DeleteButton taskId={taskId} />}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {taskT('overview')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="text-sm">
                <DetailField
                  label={taskT('splitter')}
                  value={task?.nameSplitter}
                />
                <DetailField
                  label={taskT('environment')}
                  value={task?.processConfiguration?.environment}
                />
                <DetailField label={taskT('runtime')} value={task?.runtime} />
                <DetailField
                  label={taskT('minServiceCount')}
                  value={task?.minServiceCount}
                />
                <DetailField
                  label={taskT('startPort')}
                  value={task?.startPort}
                />
                <DetailField
                  label={taskT('maxMemory')}
                  value={`${task?.processConfiguration?.maxHeapMemorySize} MB`}
                />
                <DetailField
                  label={taskT('templates')}
                  value={task?.templates?.length ?? 0}
                />
                <DetailField
                  label={taskT('groups')}
                  value={task?.groups?.length ?? 0}
                />
                <DetailField
                  label={taskT('maintenance')}
                  value={task?.maintenance ? taskT('yes') : taskT('no')}
                  mono={false}
                />
                <DetailField
                  label={taskT('isStatic')}
                  value={task?.staticServices ? taskT('yes') : taskT('no')}
                  mono={false}
                />
              </dl>
            </CardContent>
          </Card>

          <Alert>
            <TerminalIcon className="size-4" />
            <AlertTitle>{taskT('headsUp')}</AlertTitle>
            <AlertDescription>{taskT('nameChangeWarning')}</AlertDescription>
          </Alert>
        </div>

        <div className="lg:col-span-2">
          <TaskFormEditor
            task={task}
            environments={environments}
            canEdit={hasEditPermissions}
          />
        </div>
      </div>
    </div>
  )
}

function TaskPage() {
  const { taskId } = Route.useParams()
  const { permissions, hasPermissions, task, taskExists, environments } =
    Route.useLoaderData()
  const taskT = useTranslations('Tasks')

  const hasEditPermissions = requiredEditPermissions.some((permission) =>
    permissions.includes(permission)
  )
  const hasDeletePermissions = requiredDeletePermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  // taskGet drops a payload it cannot name, so an existing id can still miss
  if (!taskExists || !task) {
    return <DoesNotExist name={taskT('name')} />
  }

  return (
    <PageLayout title={taskT('editTitle', { name: task?.name })}>
      <TaskClientPage
        task={task}
        taskId={taskId}
        hasEditPermissions={hasEditPermissions}
        hasDeletePermissions={hasDeletePermissions}
        environments={environments}
      />
    </PageLayout>
  )
}
