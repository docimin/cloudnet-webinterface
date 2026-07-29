import * as Sentry from '@sentry/tanstackstart-react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { ArrowLeftIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import PageLayout from '@/components/pageLayout'
import NoAccess from '@/components/static/noAccess'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { currentPermissions } from '@/server/auth'
import {
  type ServiceCreateResult,
  serviceCreateFromTask,
  serviceCreateFromTaskName
} from '@/server/service'
import { taskList } from '@/server/task'
import type { Task } from '@/utils/types/tasks'

const requiredSimplePermissions = [
  'cloudnet_rest:service_write',
  'cloudnet_rest:service_create_task_name',
  'global:admin'
]
const requiredAdvancedPermissions = [
  'cloudnet_rest:service_write',
  'cloudnet_rest:service_create_task',
  'global:admin'
]
const requiredTaskPermissions = [
  'cloudnet_rest:task_read',
  'cloudnet_rest:task_list',
  'global:admin'
]

export const Route = createFileRoute(
  '/{-$locale}/_authed/dashboard/services/create'
)({
  loader: async () => {
    const permissions = await currentPermissions()
    const granted = (scopes: string[]) =>
      scopes.some((scope) => permissions.includes(scope))

    const hasPermissions =
      granted(requiredSimplePermissions) || granted(requiredAdvancedPermissions)

    const tasks =
      hasPermissions && granted(requiredTaskPermissions)
        ? await taskList().catch(() => ({ tasks: [] }))
        : { tasks: [] }

    return { permissions, hasPermissions, tasks: tasks?.tasks ?? [] }
  },
  component: CreateServicePage
})

function Overrides({
  task,
  memory,
  startPort,
  javaCommand,
  runtime,
  autoDeleteOnStop,
  staticServices,
  onChange
}: {
  task: Task | undefined
  memory: string
  startPort: string
  javaCommand: string
  runtime: string
  autoDeleteOnStop: boolean
  staticServices: boolean
  onChange: (patch: Record<string, string | boolean>) => void
}) {
  const servicesT = useTranslations('Services')

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="create-memory">{servicesT('maxMemoryMb')}</Label>
        <Input
          id="create-memory"
          className="font-mono tabular-nums"
          inputMode="numeric"
          value={memory}
          placeholder={String(
            task?.processConfiguration?.maxHeapMemorySize ?? ''
          )}
          onChange={(event) => onChange({ memory: event.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="create-start-port">{servicesT('startPort')}</Label>
        <Input
          id="create-start-port"
          className="font-mono tabular-nums"
          inputMode="numeric"
          value={startPort}
          placeholder={String(task?.startPort ?? '')}
          onChange={(event) => onChange({ startPort: event.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="create-java">{servicesT('javaCommand')}</Label>
        <Input
          id="create-java"
          className="font-mono"
          value={javaCommand}
          placeholder={task?.javaCommand ?? ''}
          onChange={(event) => onChange({ javaCommand: event.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="create-runtime">{servicesT('runtime')}</Label>
        <Input
          id="create-runtime"
          className="font-mono"
          value={runtime}
          placeholder={task?.runtime ?? ''}
          onChange={(event) => onChange({ runtime: event.target.value })}
        />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="create-auto-delete"
          checked={autoDeleteOnStop}
          onCheckedChange={(value) =>
            onChange({ autoDeleteOnStop: value === true })
          }
        />
        <Label htmlFor="create-auto-delete">
          {servicesT('autoDeleteOnStop')}
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="create-static"
          checked={staticServices}
          onCheckedChange={(value) =>
            onChange({ staticServices: value === true })
          }
        />
        <Label htmlFor="create-static">{servicesT('staticService')}</Label>
      </div>
    </div>
  )
}

function CreateServicePage() {
  const { permissions, hasPermissions, tasks } = Route.useLoaderData()
  const servicesT = useTranslations('Services')
  const navigate = useNavigate()

  const [taskName, setTaskName] = useState('')
  const [pending, setPending] = useState(false)
  const [start, setStart] = useState(false)
  const [memory, setMemory] = useState('')
  const [startPort, setStartPort] = useState('')
  const [javaCommand, setJavaCommand] = useState('')
  const [runtime, setRuntime] = useState('')
  const [autoDeleteOnStop, setAutoDeleteOnStop] = useState(false)
  const [staticServices, setStaticServices] = useState(false)

  const granted = (scopes: string[]) =>
    scopes.some((scope) => permissions.includes(scope))

  const maySimple = granted(requiredSimplePermissions)
  const mayAdvanced =
    granted(requiredAdvancedPermissions) && granted(requiredTaskPermissions)

  if (!hasPermissions || (!maySimple && !mayAdvanced)) {
    return <NoAccess />
  }

  const list = tasks
    .filter((task) => Boolean(task?.name))
    .sort((a, b) => a.name.localeCompare(b.name))
  const selected = list.find((task) => task.name === taskName)

  // the advanced tab has to mirror the picked task before overriding it
  const pickTask = (name: string) => {
    setTaskName(name)
    const task = list.find((entry) => entry.name === name)
    setAutoDeleteOnStop(task?.autoDeleteOnStop ?? false)
    setStaticServices(task?.staticServices ?? false)
    setMemory('')
    setStartPort('')
    setJavaCommand('')
    setRuntime('')
  }

  const applyOverrides = (patch: Record<string, string | boolean>) => {
    if (typeof patch.memory === 'string') setMemory(patch.memory)
    if (typeof patch.startPort === 'string') setStartPort(patch.startPort)
    if (typeof patch.javaCommand === 'string') setJavaCommand(patch.javaCommand)
    if (typeof patch.runtime === 'string') setRuntime(patch.runtime)
    if (typeof patch.autoDeleteOnStop === 'boolean') {
      setAutoDeleteOnStop(patch.autoDeleteOnStop)
    }
    if (typeof patch.staticServices === 'boolean') {
      setStaticServices(patch.staticServices)
    }
  }

  const settle = (result: ServiceCreateResult) => {
    if (result?.state === 'FAILED' || !result) {
      toast.error(servicesT('createFailed'))
      return
    }
    if (result.state === 'DEFERRED' || !result.serviceInfo) {
      toast.success(servicesT('createDeferred'))
      navigate({ to: '/{-$locale}/dashboard/services' })
      return
    }
    const identity = result.serviceInfo.configuration.serviceId
    toast.success(
      servicesT('createSucceeded', {
        name: `${identity.taskName}${identity.nameSplitter}${identity.taskServiceId}`
      })
    )
    navigate({
      to: '/{-$locale}/dashboard/services/$serviceId',
      params: { serviceId: identity.uniqueId }
    })
  }

  const createSimple = async () => {
    setPending(true)
    try {
      settle(await serviceCreateFromTaskName({ data: { taskName } }))
    } catch (error) {
      Sentry.captureException(error)
      toast.error(servicesT('createFailed'))
    } finally {
      setPending(false)
    }
  }

  const createAdvanced = async () => {
    if (!selected) return
    const parsedMemory = Number.parseInt(memory, 10)
    const parsedPort = Number.parseInt(startPort, 10)
    const task = {
      ...selected,
      autoDeleteOnStop,
      staticServices,
      runtime: runtime.trim() || selected.runtime,
      javaCommand: javaCommand.trim() || selected.javaCommand,
      startPort: Number.isNaN(parsedPort) ? selected.startPort : parsedPort,
      processConfiguration: {
        ...selected.processConfiguration,
        maxHeapMemorySize: Number.isNaN(parsedMemory)
          ? selected.processConfiguration?.maxHeapMemorySize
          : parsedMemory
      }
    }

    setPending(true)
    try {
      settle(await serviceCreateFromTask({ data: { task, start } }))
    } catch (error) {
      Sentry.captureException(error)
      toast.error(servicesT('createFailed'))
    } finally {
      setPending(false)
    }
  }

  const taskField = (id: string) =>
    list.length === 0 ? (
      <Input
        id={id}
        className="font-mono"
        value={taskName}
        placeholder={servicesT('taskNamePlaceholder')}
        onChange={(event) => setTaskName(event.target.value)}
      />
    ) : (
      <Select value={taskName} onValueChange={pickTask}>
        <SelectTrigger id={id} className="font-mono">
          <SelectValue placeholder={servicesT('selectTask')} />
        </SelectTrigger>
        <SelectContent>
          {list.map((task) => (
            <SelectItem key={task.name} value={task.name} className="font-mono">
              {task.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )

  return (
    <PageLayout title={servicesT('createService')}>
      <div className="flex max-w-2xl flex-col gap-6">
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/{-$locale}/dashboard/services">
              <ArrowLeftIcon className="mr-2 size-4" />
              {servicesT('backToServices')}
            </Link>
          </Button>
        </div>

        <Tabs defaultValue={maySimple ? 'simple' : 'advanced'}>
          <TabsList>
            {maySimple && (
              <TabsTrigger value="simple">{servicesT('simple')}</TabsTrigger>
            )}
            {mayAdvanced && (
              <TabsTrigger value="advanced">
                {servicesT('advanced')}
              </TabsTrigger>
            )}
          </TabsList>

          {maySimple && (
            <TabsContent value="simple" className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                {servicesT('simpleDescription')}
              </p>
              <div className="space-y-2">
                <Label htmlFor="simple-task">{servicesT('task')}</Label>
                {taskField('simple-task')}
              </div>
              <Button
                disabled={pending || taskName.trim() === ''}
                onClick={createSimple}
              >
                <PlusIcon className="mr-2 size-4" />
                {servicesT('createService')}
              </Button>
            </TabsContent>
          )}

          {mayAdvanced && (
            <TabsContent value="advanced" className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                {servicesT('advancedDescription')}
              </p>
              <div className="space-y-2">
                <Label htmlFor="advanced-task">{servicesT('task')}</Label>
                {taskField('advanced-task')}
              </div>
              {list.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {servicesT('noTasksAvailable')}
                </p>
              )}
              <Overrides
                task={selected}
                memory={memory}
                startPort={startPort}
                javaCommand={javaCommand}
                runtime={runtime}
                autoDeleteOnStop={autoDeleteOnStop}
                staticServices={staticServices}
                onChange={applyOverrides}
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  id="create-start"
                  checked={start}
                  onCheckedChange={(value) => setStart(value === true)}
                />
                <Label htmlFor="create-start">
                  {servicesT('startImmediately')}
                </Label>
              </div>
              <Button disabled={pending || !selected} onClick={createAdvanced}>
                <PlusIcon className="mr-2 size-4" />
                {servicesT('createService')}
              </Button>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </PageLayout>
  )
}
