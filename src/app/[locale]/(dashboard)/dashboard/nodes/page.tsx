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
import { getNodes } from '@/utils/server-api/nodes/getNodes'
import { NodesType } from '@/utils/types/nodes'
import { Button } from '@/components/ui/button'
import { getPermissions } from '@/utils/server-api/user/getPermissions'
import NoAccess from '@/components/static/noAccess'
import NoRecords from '@/components/static/noRecords'
import { Link } from '@/navigation'

export const runtime = 'edge'

export default async function NodesPage({ params: { locale } }) {
  const nodes: NodesType = await getNodes()
  const permissions: string[] = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:cluster_read',
    'cloudnet_rest:cluster_node_list',
    'global:admin',
  ]
  const requiredEditPermissions = [
    'cloudnet_rest:cluster_read',
    'cloudnet_rest:cluster_node_get',
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

  if (!nodes.nodes) {
    return <NoRecords />
  }

  return (
    <PageLayout title={'Nodes'}>
      <Table>
        <TableCaption>A list of your nodes.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Memory</TableHead>
            <TableHead>Version</TableHead>
            {hasEditPermissions && (
              <TableHead className="sr-only">Edit</TableHead>
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
                    <Link
                      href={{
                        pathname: '/dashboard/nodes/[nodeId]',
                        params: { nodeId: node.node.uniqueId },
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