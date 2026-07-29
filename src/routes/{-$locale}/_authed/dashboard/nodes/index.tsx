import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { SlidersHorizontalIcon, TerminalIcon } from 'lucide-react'
import PageHeader from '@/components/pageHeader'
import PageLayout from '@/components/pageLayout'
import NoAccess from '@/components/static/noAccess'
import NoRecords from '@/components/static/noRecords'
import { StatusIndicator } from '@/components/status'
import TableEmpty from '@/components/tableEmpty'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { nodeStatus } from '@/lib/cloudnetStatus'
import { cn } from '@/lib/utils'
import { currentPermissions } from '@/server/auth'
import { nodeList } from '@/server/node'
import type { Version } from '@/utils/types/nodes'

const requiredPermissions = [
  'cloudnet_rest:cluster_read',
  'cloudnet_rest:cluster_node_list',
  'global:admin'
]
const requiredEditPermissions = [
  'cloudnet_rest:cluster_read',
  'cloudnet_rest:cluster_node_get',
  'global:admin'
]

export const Route = createFileRoute('/{-$locale}/_authed/dashboard/nodes/')({
  loader: async () => {
    const permissions = await currentPermissions()
    const hasPermissions = requiredPermissions.some((permission) =>
      permissions.includes(permission)
    )
    return {
      permissions,
      hasPermissions,
      nodes: hasPermissions ? await nodeList() : null
    }
  },
  component: NodesPage
})

function versionNumber(version?: Version) {
  if (!version) return null
  const parts = [version.major, version.minor, version.patch].filter(
    (part) => part !== undefined && part !== null
  )
  return parts.length ? parts.join('.') : null
}

function NodesPage() {
  const { permissions, hasPermissions, nodes } = Route.useLoaderData()
  const navigate = useNavigate()
  const nodesT = useTranslations('Nodes')
  const statusT = useTranslations('Status')

  const hasEditPermissions = requiredEditPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!nodes?.nodes) {
    return <NoRecords />
  }

  const rows = [...nodes.nodes]
    .filter((entry) => Boolean(entry?.node?.uniqueId))
    .sort((a, b) => a.node.uniqueId.localeCompare(b.node.uniqueId))

  const open = (nodeId: string) =>
    navigate({
      to: '/{-$locale}/dashboard/nodes/$nodeId',
      params: { nodeId }
    })

  return (
    <PageLayout title={nodesT('title')}>
      <div className="flex flex-col gap-4">
        <PageHeader count={rows.length} caption={nodesT('tableCaption')}>
          <Link to={'/{-$locale}/dashboard/nodes/config'}>
            <Button variant={'outline'} size={'sm'}>
              <SlidersHorizontalIcon className="mr-2 size-4" />
              {nodesT('localNodeTitle')}
            </Button>
          </Link>
          <Link to={'/{-$locale}/dashboard/nodes/console'}>
            <Button variant={'outline'} size={'sm'}>
              <TerminalIcon className="mr-2 size-4" />
              {statusT('openConsole')}
            </Button>
          </Link>
        </PageHeader>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-32">{nodesT('status')}</TableHead>
                <TableHead>{nodesT('name')}</TableHead>
                <TableHead className="text-right">{nodesT('memory')}</TableHead>
                <TableHead className="text-right">
                  {nodesT('services')}
                </TableHead>
                <TableHead>{nodesT('version')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableEmpty
                  colSpan={5}
                  title={nodesT('noNodes')}
                  description={nodesT('noNodesDescription')}
                />
              )}
              {rows.map((node) => {
                const snapshot = node.nodeInfoSnapshot
                const status = nodeStatus(node.state, snapshot?.drain)
                const version = versionNumber(snapshot?.version)

                return (
                  <TableRow
                    key={node.node.uniqueId}
                    className={cn(
                      'hover:bg-muted/50',
                      hasEditPermissions && 'cursor-pointer'
                    )}
                    onClick={
                      hasEditPermissions
                        ? () => open(node.node.uniqueId)
                        : undefined
                    }
                  >
                    <TableCell>
                      <StatusIndicator
                        status={status}
                        label={statusT(status)}
                        showLabel
                      />
                    </TableCell>
                    <TableCell className="font-mono font-medium">
                      {hasEditPermissions ? (
                        <Link
                          to="/{-$locale}/dashboard/nodes/$nodeId"
                          params={{ nodeId: node.node.uniqueId }}
                          onClick={(event) => event.stopPropagation()}
                          className="hover:underline focus-visible:underline"
                        >
                          {node.node.uniqueId}
                        </Link>
                      ) : (
                        node.node.uniqueId
                      )}
                      {node.head && (
                        <span className="ml-2 font-sans text-xs text-muted-foreground">
                          {nodesT('head')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {snapshot ? (
                        <>
                          {snapshot.usedMemory}
                          <span className="text-muted-foreground">
                            {' / '}
                            {snapshot.maxMemory} MB
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {snapshot?.currentServicesCount ?? 0}
                    </TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {version ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                      {snapshot?.version?.versionType && (
                        <span className="ml-2 font-sans text-xs text-muted-foreground">
                          {snapshot.version.versionType}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageLayout>
  )
}
