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
import { serverNodeApi } from '@/lib/server-api'
import { Button } from '@/components/ui/button'
import { getPermissions } from '@/utils/server-api/getPermissions'
import NoAccess from '@/components/static/noAccess'
import NoRecords from '@/components/static/noRecords'
import Link from 'next/link'
import { getDict } from 'gt-next/server'

export default async function NodesPage() {
  const nodesT = await getDict('Nodes')
  const mainT = await getDict('Main')

  const nodes = await serverNodeApi.list()
  const permissions: string[] = await getPermissions()
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

  if (!nodes.nodes) {
    return <NoRecords />
  }

  return (
    <PageLayout title={nodesT('title')}>
      <Table>
        <TableCaption>{nodesT('tableCaption')}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">{nodesT('name')}</TableHead>
            <TableHead>{nodesT('status')}</TableHead>
            <TableHead>{nodesT('memory')}</TableHead>
            <TableHead>{nodesT('version')}</TableHead>
            {hasEditPermissions && (
              <TableHead className="sr-only">{mainT('edit')}</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {nodes.nodes
            .sort((a, b) => a.node.uniqueId.localeCompare(b.node.uniqueId))
            .map((node) => (
              <TableRow key={node.node.uniqueId}>
                <TableCell className="font-medium">
                  {node.node.uniqueId}
                </TableCell>
                <TableCell>{node.state}</TableCell>
                <TableCell>
                  {node?.nodeInfoSnapshot?.usedMemory} /{' '}
                  {node?.nodeInfoSnapshot?.maxMemory}
                </TableCell>
                <TableCell>
                  {node?.nodeInfoSnapshot?.version?.major}
                  {node?.nodeInfoSnapshot?.version?.minor !== undefined && '.'}
                  {node?.nodeInfoSnapshot?.version?.minor}
                  {node?.nodeInfoSnapshot?.version?.patch !== undefined && '.'}
                  {node?.nodeInfoSnapshot?.version?.patch}
                  {node?.nodeInfoSnapshot?.version?.versionType !== undefined &&
                    ' | '}
                  {node?.nodeInfoSnapshot?.version?.versionType}
                </TableCell>
                {hasEditPermissions && (
                  <TableCell>
                    <Link href={`/dashboard/nodes/${node.node.uniqueId}`}>
                      <Button
                        size={'sm'}
                        variant={'link'}
                        className={'p-0 text-right'}
                      >
                        {mainT('edit')}
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
