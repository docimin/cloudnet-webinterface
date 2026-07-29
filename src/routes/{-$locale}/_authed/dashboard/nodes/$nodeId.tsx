import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import {
  CableIcon,
  CpuIcon,
  DatabaseZapIcon,
  GitBranchIcon,
  MemoryStickIcon,
  PlayIcon,
  ServerOffIcon,
  TerminalIcon
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import AutoRefresh from '@/components/autoRefresh'
import Meter, { loadTone } from '@/components/meter'
import PageLayout from '@/components/pageLayout'
import DoesNotExist from '@/components/static/doesNotExist'
import NoAccess from '@/components/static/noAccess'
import { StatusIndicator } from '@/components/status'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { nodeStatus } from '@/lib/cloudnetStatus'
import { cn } from '@/lib/utils'
import { currentPermissions } from '@/server/auth'
import {
  nodeClusterGet,
  nodeCommand,
  nodeDrain,
  nodeUpdate
} from '@/server/node'
import type { Nodes } from '@/utils/types/nodes'

const requiredPermissions = [
  'cloudnet_rest:cluster_read',
  'cloudnet_rest:cluster_node_get',
  'global:admin'
]
const requiredUpdatePermissions = [
  'cloudnet_rest:cluster_write',
  'cloudnet_rest:cluster_node_update',
  'global:admin'
]
const requiredDrainPermissions = [
  'cloudnet_rest:cluster_write',
  'cloudnet_rest:cluster_node_change_draining',
  'global:admin'
]
const requiredCommandPermissions = [
  'cloudnet_rest:cluster_write',
  'cloudnet_rest:cluster_node_command',
  'global:admin'
]

export const Route = createFileRoute(
  '/{-$locale}/_authed/dashboard/nodes/$nodeId'
)({
  loader: async ({ params }) => {
    const permissions = await currentPermissions()
    const granted = (required: string[]) =>
      required.some((permission) => permissions.includes(permission))

    const hasPermissions = granted(requiredPermissions)
    return {
      hasPermissions,
      hasUpdatePermissions: granted(requiredUpdatePermissions),
      hasDrainPermissions: granted(requiredDrainPermissions),
      hasCommandPermissions: granted(requiredCommandPermissions),
      node: hasPermissions
        ? await nodeClusterGet({ data: { id: params.nodeId } })
        : null
    }
  },
  component: NodePage
})

function NodePage() {
  const { nodeId } = Route.useParams()
  const {
    hasPermissions,
    hasUpdatePermissions,
    hasDrainPermissions,
    hasCommandPermissions,
    node
  } = Route.useLoaderData()
  const navigationT = useTranslations('Navigation')

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!node?.node?.uniqueId) {
    return <DoesNotExist name={navigationT('nodes')} />
  }

  return (
    <PageLayout title={node?.node?.uniqueId}>
      <AutoRefresh timer={5000}>
        <NodeClientPage
          node={node}
          nodeId={nodeId}
          hasUpdatePermissions={hasUpdatePermissions}
          hasDrainPermissions={hasDrainPermissions}
          hasCommandPermissions={hasCommandPermissions}
        />
      </AutoRefresh>
    </PageLayout>
  )
}

function StatCard({
  title,
  icon: Icon,
  children
}: {
  title: string
  icon: typeof CpuIcon
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2">{children}</CardContent>
    </Card>
  )
}

function DrainButton({
  nodeId,
  draining
}: {
  nodeId: string
  draining: boolean
}) {
  const nodesT = useTranslations('Nodes')
  const router = useRouter()

  const handleDrain = async () => {
    try {
      await nodeDrain({ data: { id: nodeId, draining: !draining } })
      toast.success(draining ? nodesT('drainStopped') : nodesT('drainStarted'))
      router.invalidate()
    } catch {
      toast.error(nodesT('drainFailed'))
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={draining ? 'outline' : 'destructive'} size="sm">
          <ServerOffIcon className="mr-2 size-4" />
          {draining ? nodesT('resumeNode') : nodesT('drainNode')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {draining ? nodesT('resumeTitle') : nodesT('drainTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {draining
              ? nodesT('resumeDescription')
              : nodesT('drainDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{nodesT('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDrain}>
            {draining ? nodesT('resumeNode') : nodesT('drainNode')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function CommandRunner({ nodeId }: { nodeId: string }) {
  const nodesT = useTranslations('Nodes')
  const [command, setCommand] = useState('')
  const [lines, setLines] = useState<string[] | null>(null)

  const handleRun = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!command.trim()) return
    try {
      const result = await nodeCommand({
        data: { id: nodeId, command: command.trim() }
      })
      setLines(result.lines ?? [])
    } catch {
      toast.error(nodesT('commandFailed'))
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {nodesT('command')}
        </CardTitle>
        <TerminalIcon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        <form onSubmit={handleRun} className="flex flex-wrap items-end gap-2">
          <div className="grid flex-1 gap-1.5">
            <Label htmlFor="command" className="text-xs text-muted-foreground">
              {nodesT('commandDescription')}
            </Label>
            <Input
              id="command"
              name="command"
              className="font-mono"
              placeholder={nodesT('commandPlaceholder')}
              value={command}
              onChange={(event) => setCommand(event.target.value)}
            />
          </div>
          <Button size="sm" type="submit" disabled={!command.trim()}>
            <PlayIcon className="mr-2 size-4" />
            {nodesT('commandRun')}
          </Button>
        </form>
        {lines !== null && (
          <div className="max-h-64 overflow-auto rounded-lg border p-3">
            {lines.length ? (
              <pre className="font-mono text-xs whitespace-pre-wrap">
                {lines.join('\n')}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">
                {nodesT('commandNoOutput')}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function NodeClientPage({
  node,
  nodeId,
  hasUpdatePermissions,
  hasDrainPermissions,
  hasCommandPermissions
}: {
  node: Nodes
  nodeId: string
  hasUpdatePermissions: boolean
  hasDrainPermissions: boolean
  hasCommandPermissions: boolean
}) {
  const nodesT = useTranslations('Nodes')
  const mainT = useTranslations('Main')
  const statusT = useTranslations('Status')

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const ip = formData.get('ip')?.toString() || ''
    const port = formData.get('port')?.toString() || ''

    if (ip === '' || port === '') {
      toast.error(nodesT('ipPortRequired'))
      return
    }
    try {
      await nodeUpdate({ data: { id: nodeId, ip, port } })
      toast.success(nodesT('nodeUpdated'))
    } catch {
      toast.error(nodesT('updateFailed'))
    }
  }

  const snapshot = node?.nodeInfoSnapshot
  const status = nodeStatus(node.state, snapshot?.drain)
  const process = snapshot?.processSnapshot
  const usedMemory = snapshot?.usedMemory
  const maxMemory = snapshot?.maxMemory
  const memoryPercent =
    usedMemory && maxMemory ? Math.min(100, (usedMemory / maxMemory) * 100) : 0
  const version = snapshot?.version

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <StatusIndicator status={status} label={statusT(status)} showLabel />
          <span className="font-mono text-sm text-muted-foreground">
            {node.node.uniqueId}
          </span>
          {node.head && (
            <span className="text-xs text-muted-foreground">
              {nodesT('head')}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasDrainPermissions && snapshot && (
            <DrainButton nodeId={nodeId} draining={Boolean(snapshot.drain)} />
          )}
          {hasUpdatePermissions && (
            <Button size="sm" type="submit" form="node-connection">
              {mainT('save')}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title={nodesT('cpuUsage')} icon={CpuIcon}>
          <div className="font-mono text-2xl font-semibold tabular-nums">
            {process?.cpuUsage ? `${process.cpuUsage.toFixed(2)}%` : '—'}
          </div>
          <p className="text-xs text-muted-foreground">
            {nodesT('systemUsage')}
            {': '}
            <span className="font-mono tabular-nums">
              {process?.systemCpuUsage
                ? `${process.systemCpuUsage.toFixed(2)}%`
                : '—'}
            </span>
          </p>
        </StatCard>

        <StatCard title={nodesT('memory')} icon={MemoryStickIcon}>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold tabular-nums">
              {usedMemory ?? 0}
            </span>
            <span className="font-mono text-sm tabular-nums text-muted-foreground">
              / {maxMemory ?? 0} MB
            </span>
          </div>
          <Meter
            value={memoryPercent}
            label={nodesT('memory')}
            valueText={`${usedMemory ?? 0} / ${maxMemory ?? 0} MB`}
          />
          <p className="text-xs text-muted-foreground">
            <span
              className={cn('font-mono tabular-nums', loadTone(memoryPercent))}
            >
              {memoryPercent.toFixed(0)}%
            </span>{' '}
            {statusT('ofCapacity')}
          </p>
        </StatCard>

        <StatCard title={nodesT('servicesCount')} icon={DatabaseZapIcon}>
          <div className="font-mono text-2xl font-semibold tabular-nums">
            {snapshot?.currentServicesCount ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {nodesT('currentServicesCount')}
          </p>
        </StatCard>

        <StatCard title={nodesT('drainStatus')} icon={ServerOffIcon}>
          {snapshot?.drain ? (
            <StatusIndicator
              status="draining"
              label={nodesT('draining')}
              showLabel
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {nodesT('notDraining')}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {snapshot?.drain
              ? nodesT('drainingHint')
              : nodesT('notDrainingHint')}
          </p>
        </StatCard>

        <StatCard title={nodesT('version')} icon={GitBranchIcon}>
          <div className="font-mono text-2xl font-semibold tabular-nums">
            {version
              ? [version.major, version.minor, version.patch]
                  .filter((part) => part !== undefined && part !== null)
                  .join('.')
              : '—'}
          </div>
          {version?.versionType && (
            <p className="text-xs text-muted-foreground">
              {version.versionType}
            </p>
          )}
        </StatCard>

        <StatCard title={nodesT('connectionDetails')} icon={CableIcon}>
          <form
            id="node-connection"
            onSubmit={handleSave}
            className="space-y-2"
          >
            <div className="grid gap-1.5">
              <Label htmlFor="ip" className="text-xs text-muted-foreground">
                {nodesT('ip')}
              </Label>
              <Input
                id="ip"
                type="text"
                name="ip"
                className="font-mono"
                readOnly={!hasUpdatePermissions}
                defaultValue={node?.node?.listeners?.[0]?.host}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="port" className="text-xs text-muted-foreground">
                {nodesT('port')}
              </Label>
              <Input
                id="port"
                type="text"
                name="port"
                className="font-mono tabular-nums"
                readOnly={!hasUpdatePermissions}
                defaultValue={node?.node?.listeners?.[0]?.port}
              />
            </div>
          </form>
        </StatCard>
      </div>

      {hasCommandPermissions && <CommandRunner nodeId={nodeId} />}
    </div>
  )
}
