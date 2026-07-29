import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { ActivityIcon, RotateCwIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import PageLayout from '@/components/pageLayout'
import NoAccess from '@/components/static/noAccess'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { currentPermissions } from '@/server/auth'
import {
  nodeConfigGet,
  nodeConfigUpdate,
  nodeLogLines,
  nodePing,
  nodeReload
} from '@/server/node'

const requiredPermissions = [
  'cloudnet_rest:node_read',
  'cloudnet_rest:node_config_get',
  'global:admin'
]
const requiredUpdatePermissions = [
  'cloudnet_rest:node_write',
  'cloudnet_rest:node_config_update',
  'global:admin'
]
const requiredReloadPermissions = [
  'cloudnet_rest:node_write',
  'cloudnet_rest:node_reload',
  'global:admin'
]
const requiredPingPermissions = [
  'cloudnet_rest:node_read',
  'cloudnet_rest:node_ping',
  'global:admin'
]
const requiredLogPermissions = [
  'cloudnet_rest:node_read',
  'cloudnet_rest:node_log_lines',
  'global:admin'
]

type LogFormat = 'raw' | 'ansi'

export const Route = createFileRoute(
  '/{-$locale}/_authed/dashboard/nodes/config'
)({
  loader: async () => {
    const permissions = await currentPermissions()
    const granted = (required: string[]) =>
      required.some((permission) => permissions.includes(permission))

    const hasPermissions = granted(requiredPermissions)
    const hasLogPermissions = granted(requiredLogPermissions)

    return {
      hasPermissions,
      hasUpdatePermissions: granted(requiredUpdatePermissions),
      hasReloadPermissions: granted(requiredReloadPermissions),
      hasPingPermissions: granted(requiredPingPermissions),
      hasLogPermissions,
      config: hasPermissions ? await nodeConfigGet() : null,
      logLines: hasLogPermissions
        ? await nodeLogLines({ data: { format: 'raw' } })
        : null
    }
  },
  component: NodeConfigPage
})

function NodeConfigPage() {
  const {
    hasPermissions,
    hasUpdatePermissions,
    hasReloadPermissions,
    hasPingPermissions,
    hasLogPermissions,
    config,
    logLines
  } = Route.useLoaderData()
  const nodesT = useTranslations('Nodes')
  const mainT = useTranslations('Main')

  const [draft, setDraft] = useState(
    config ? JSON.stringify(config, null, 2) : ''
  )
  const [format, setFormat] = useState<LogFormat>('raw')
  const [lines, setLines] = useState<string[]>(logLines?.lines ?? [])
  const [pendingReload, setPendingReload] = useState<'all' | 'config' | null>(
    null
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(draft)
    } catch {
      toast.error(mainT('invalidJson'))
      return
    }
    try {
      await nodeConfigUpdate({ data: { config: parsed } })
      toast.success(nodesT('configUpdated'))
    } catch {
      toast.error(nodesT('configUpdateFailed'))
    }
  }

  const handleReload = async (type: 'all' | 'config') => {
    setPendingReload(null)
    try {
      await nodeReload({ data: { type } })
      toast.success(nodesT('reloadRequested'))
    } catch {
      toast.error(nodesT('reloadFailed'))
    }
  }

  const handlePing = async () => {
    try {
      await nodePing()
      toast.success(nodesT('pingSuccess'))
    } catch {
      toast.error(nodesT('pingFailed'))
    }
  }

  const handleFormat = async (next: LogFormat) => {
    setFormat(next)
    try {
      const result = await nodeLogLines({ data: { format: next } })
      setLines(result.lines ?? [])
    } catch {
      toast.error(nodesT('logLinesFailed'))
    }
  }

  return (
    <PageLayout title={nodesT('localNodeTitle')}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="max-w-prose text-sm text-muted-foreground">
            {nodesT('localNodeDescription')}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {hasPingPermissions && (
              <Button variant="outline" size="sm" onClick={handlePing}>
                <ActivityIcon className="mr-2 size-4" />
                {nodesT('ping')}
              </Button>
            )}
            {hasReloadPermissions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <RotateCwIcon className="mr-2 size-4" />
                    {nodesT('reload')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setPendingReload('all')}>
                    {nodesT('reloadAll')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPendingReload('config')}>
                    {nodesT('reloadConfig')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {hasUpdatePermissions && (
              <Button size="sm" type="submit" form="node-config">
                {mainT('save')}
              </Button>
            )}
          </div>
        </div>

        <form id="node-config" onSubmit={handleSave} className="space-y-2">
          <Label htmlFor="config">{nodesT('configJson')}</Label>
          <Textarea
            id="config"
            name="config"
            className="h-96 font-mono text-xs"
            required
            readOnly={!hasUpdatePermissions}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </form>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor="log-format">{nodesT('logLines')}</Label>
            {hasLogPermissions && (
              <Select
                value={format}
                onValueChange={(next) => handleFormat(next as LogFormat)}
              >
                <SelectTrigger id="log-format" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="raw">{nodesT('logFormatRaw')}</SelectItem>
                  <SelectItem value="ansi">
                    {nodesT('logFormatAnsi')}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="h-72 overflow-auto rounded-lg border p-3">
            {hasLogPermissions ? (
              lines.length ? (
                <pre className="font-mono text-xs whitespace-pre-wrap">
                  {lines.join('\n')}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {nodesT('logLinesEmpty')}
                </p>
              )
            ) : (
              <p className="text-sm text-muted-foreground">
                {nodesT('logLinesNoAccess')}
              </p>
            )}
          </div>
        </div>
      </div>

      <AlertDialog
        open={pendingReload !== null}
        onOpenChange={(next) => {
          if (!next) setPendingReload(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{nodesT('reloadTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingReload === 'config'
                ? nodesT('reloadConfigDescription')
                : nodesT('reloadAllDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{nodesT('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingReload && handleReload(pendingReload)}
            >
              {nodesT('reload')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  )
}
