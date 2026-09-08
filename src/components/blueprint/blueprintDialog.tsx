import * as Sentry from '@sentry/tanstackstart-react'
import { useRouter } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { WandSparklesIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  blueprintBootstrap,
  blueprintCreate,
  READY_TIMEOUT_MS
} from '@/server/blueprint'
import {
  serviceEnvironmentList,
  serviceVersionList
} from '@/server/serviceVersion'
import { storageList } from '@/server/templates'
import type {
  ServiceEnvironmentType,
  ServiceVersionType
} from '@/utils/types/serviceVersions'
import { STEP_KEYS } from './steps'

// kept in step with the server validator in src/server/blueprint.ts so a bad
// name is named as such instead of coming back as a schema rejection
const TASK_NAME = /^[A-Za-z0-9_-]{1,40}$/

const DEFAULT_STORAGE = 'local'
const NO_VERSION = 'none'
const TIMEOUT_SECONDS = Math.round(READY_TIMEOUT_MS / 1000)

type Phase = 'idle' | 'prepare' | 'bootstrap'

const numberOr = (value: string, fallback: number) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

export default function BlueprintDialog() {
  const blueprintT = useTranslations('Blueprint')
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [elapsed, setElapsed] = useState(0)

  const [environments, setEnvironments] = useState<ServiceEnvironmentType[]>([])
  const [types, setTypes] = useState<ServiceVersionType[]>([])
  const [storages, setStorages] = useState([DEFAULT_STORAGE])
  const [listFailed, setListFailed] = useState(false)

  const [taskName, setTaskName] = useState('')
  const [environment, setEnvironment] = useState('')
  const [versionType, setVersionType] = useState(NO_VERSION)
  const [version, setVersion] = useState('')
  const [storage, setStorage] = useState(DEFAULT_STORAGE)
  const [memory, setMemory] = useState('512')
  const [minServiceCount, setMinServiceCount] = useState('0')
  const [startPort, setStartPort] = useState('44955')
  const [groups, setGroups] = useState('')
  const [staticServices, setStaticServices] = useState(false)
  const [javaCommand, setJavaCommand] = useState('')
  const [bootstrap, setBootstrap] = useState(false)

  useEffect(() => {
    if (!open) return
    let active = true
    Promise.all([serviceEnvironmentList(), serviceVersionList()])
      .then(([environmentList, versionList]) => {
        if (!active) return
        setEnvironments(environmentList.environments ?? [])
        setTypes(versionList.serviceVersionTypes ?? [])
      })
      .catch((error) => {
        Sentry.captureException(error)
        if (active) setListFailed(true)
      })
    storageList()
      .then((result) => {
        if (!active) return
        setStorages([
          ...new Set([DEFAULT_STORAGE, ...(result?.storages ?? [])])
        ])
      })
      .catch((error) => {
        // the default storage stays selectable, so a failed list is not fatal
        Sentry.captureException(error)
      })
    return () => {
      active = false
    }
  }, [open])

  useEffect(() => {
    if (phase !== 'bootstrap') return
    const started = Date.now()
    setElapsed(0)
    const timer = setInterval(
      () => setElapsed(Math.round((Date.now() - started) / 1000)),
      1000
    )
    return () => clearInterval(timer)
  }, [phase])

  const visibleTypes = types
    .filter((entry) => !environment || entry.environmentType === environment)
    .sort((a, b) => a.name.localeCompare(b.name))
  const versions =
    visibleTypes.find((entry) => entry.name === versionType)?.versions ?? []

  const running = phase !== 'idle'
  const complete =
    TASK_NAME.test(taskName.trim()) &&
    environment !== '' &&
    (versionType === NO_VERSION || version !== '')

  const submit = async () => {
    const name = taskName.trim()
    if (!TASK_NAME.test(name)) {
      toast.error(blueprintT('invalidTaskName'))
      return
    }

    setPhase('prepare')
    try {
      const created = await blueprintCreate({
        data: {
          taskName: name,
          storage,
          environment,
          groups: groups
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean),
          staticServices,
          memory: numberOr(memory, 512),
          minServiceCount: numberOr(minServiceCount, 0),
          startPort: numberOr(startPort, 44955),
          javaCommand: javaCommand.trim() || null,
          serviceVersionType: versionType === NO_VERSION ? null : versionType,
          serviceVersion: versionType === NO_VERSION ? null : version
        }
      })
      if (!created.ok) {
        toast.error(
          blueprintT('stepFailed', {
            step: blueprintT(STEP_KEYS[created.step]),
            message: created.message
          })
        )
        return
      }

      if (!bootstrap) {
        toast.success(blueprintT('created', { name }))
        setOpen(false)
        return
      }

      setPhase('bootstrap')
      const seeded = await blueprintBootstrap({
        data: { taskName: name, template: created.template }
      })
      if (seeded.cleanup) {
        toast.error(blueprintT('cleanupFailed', { message: seeded.cleanup }))
      }
      if (!seeded.ok) {
        toast.error(
          blueprintT('stepFailed', {
            step: blueprintT(STEP_KEYS[seeded.step]),
            message: seeded.message
          })
        )
        return
      }
      if (seeded.ready === 'connected') {
        toast.warning(blueprintT('onlyConnected'))
      }
      toast.success(blueprintT('createdWithConfigs', { name }))
      setOpen(false)
    } catch (error) {
      Sentry.captureException(error)
      toast.error(blueprintT('createFailed'))
    } finally {
      setPhase('idle')
      // a failed bootstrap still leaves the task behind, so the list is
      // refreshed on every outcome
      router.invalidate()
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <WandSparklesIcon className="mr-2 size-4" />
        {blueprintT('newTask')}
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!running) setOpen(next)
        }}
      >
        <DialogContent className="max-h-svh overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{blueprintT('title')}</DialogTitle>
            <DialogDescription>{blueprintT('description')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {listFailed && (
              <p className="text-sm text-destructive">
                {blueprintT('listsUnavailable')}
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="blueprint-task-name">
                  {blueprintT('taskName')}
                </Label>
                <Input
                  id="blueprint-task-name"
                  className="font-mono"
                  value={taskName}
                  onChange={(event) => setTaskName(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {blueprintT('taskNameHint')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blueprint-environment">
                  {blueprintT('environment')}
                </Label>
                <Select
                  value={environment}
                  onValueChange={(next) => {
                    setEnvironment(next)
                    setVersionType(NO_VERSION)
                    setVersion('')
                    const port = environments.find(
                      (entry) => entry.name === next
                    )?.defaultServiceStartPort
                    if (port) setStartPort(String(port))
                  }}
                >
                  <SelectTrigger
                    id="blueprint-environment"
                    className="font-mono"
                  >
                    <SelectValue
                      placeholder={blueprintT('selectEnvironment')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {[...environments]
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((entry) => (
                        <SelectItem
                          key={entry.name}
                          value={entry.name}
                          className="font-mono"
                        >
                          {entry.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blueprint-version-type">
                  {blueprintT('versionType')}
                </Label>
                <Select
                  value={versionType}
                  onValueChange={(next) => {
                    setVersionType(next)
                    setVersion('')
                  }}
                >
                  <SelectTrigger
                    id="blueprint-version-type"
                    className="font-mono"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_VERSION}>
                      {blueprintT('noVersion')}
                    </SelectItem>
                    {visibleTypes.map((entry) => (
                      <SelectItem
                        key={entry.name}
                        value={entry.name}
                        className="font-mono"
                      >
                        {entry.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blueprint-version">
                  {blueprintT('version')}
                </Label>
                <Select
                  value={version}
                  onValueChange={setVersion}
                  disabled={versionType === NO_VERSION}
                >
                  <SelectTrigger id="blueprint-version" className="font-mono">
                    <SelectValue placeholder={blueprintT('selectVersion')} />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((entry) => (
                      <SelectItem
                        key={entry.name}
                        value={entry.name}
                        className="font-mono"
                      >
                        {entry.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blueprint-storage">
                  {blueprintT('storage')}
                </Label>
                <Select value={storage} onValueChange={setStorage}>
                  <SelectTrigger id="blueprint-storage" className="font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {storages.map((entry) => (
                      <SelectItem
                        key={entry}
                        value={entry}
                        className="font-mono"
                      >
                        {entry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blueprint-memory">{blueprintT('memory')}</Label>
                <Input
                  id="blueprint-memory"
                  className="font-mono tabular-nums"
                  inputMode="numeric"
                  value={memory}
                  onChange={(event) => setMemory(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="blueprint-min-services">
                  {blueprintT('minServiceCount')}
                </Label>
                <Input
                  id="blueprint-min-services"
                  className="font-mono tabular-nums"
                  inputMode="numeric"
                  value={minServiceCount}
                  onChange={(event) => setMinServiceCount(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="blueprint-start-port">
                  {blueprintT('startPort')}
                </Label>
                <Input
                  id="blueprint-start-port"
                  className="font-mono tabular-nums"
                  inputMode="numeric"
                  value={startPort}
                  onChange={(event) => setStartPort(event.target.value)}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="blueprint-groups">{blueprintT('groups')}</Label>
                <Input
                  id="blueprint-groups"
                  className="font-mono"
                  value={groups}
                  placeholder={blueprintT('groupsHint')}
                  onChange={(event) => setGroups(event.target.value)}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="blueprint-java">
                  {blueprintT('javaCommand')}
                </Label>
                <Input
                  id="blueprint-java"
                  className="font-mono"
                  value={javaCommand}
                  placeholder={blueprintT('javaCommandHint')}
                  onChange={(event) => setJavaCommand(event.target.value)}
                />
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <Checkbox
                id="blueprint-static"
                checked={staticServices}
                onCheckedChange={(value) => setStaticServices(value === true)}
              />
              <div className="space-y-1">
                <Label htmlFor="blueprint-static">
                  {blueprintT('staticServices')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {blueprintT('staticServicesHint')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <Checkbox
                id="blueprint-bootstrap"
                checked={bootstrap}
                onCheckedChange={(value) => setBootstrap(value === true)}
              />
              <div className="space-y-1">
                <Label htmlFor="blueprint-bootstrap">
                  {blueprintT('bootstrap')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {blueprintT('bootstrapHint', { seconds: TIMEOUT_SECONDS })}
                </p>
              </div>
            </div>

            {running && (
              <div className="space-y-1 rounded-lg border p-3">
                <p className="text-sm">
                  {phase === 'prepare'
                    ? blueprintT('preparing')
                    : blueprintT('bootstrapping')}
                </p>
                {phase === 'bootstrap' && (
                  <p className="font-mono text-xs tabular-nums text-muted-foreground">
                    {blueprintT('elapsed', {
                      seconds: elapsed,
                      timeout: TIMEOUT_SECONDS
                    })}
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={running}
              onClick={() => setOpen(false)}
            >
              {blueprintT('cancel')}
            </Button>
            <Button disabled={running || !complete} onClick={submit}>
              {blueprintT('create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
