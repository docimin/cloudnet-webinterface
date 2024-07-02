import PageLayout from '@/components/pageLayout'
import { Nodes } from '@/utils/types/nodes'
import { getNode } from '@/utils/server-api/nodes/getNode'
import { getPermissions } from '@/utils/server-api/user/getPermissions'
import NoAccess from '@/components/static/noAccess'
import DoesNotExist from '@/components/static/doesNotExist'
import NodeClientPage from '@/app/[locale]/(dashboard)/dashboard/nodes/[nodeId]/page.client'

export const runtime = 'edge'

export default async function NodePage({ params: { locale, nodeId } }) {
  const node: Nodes = await getNode(nodeId)
  const permissions: any = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:cluster_read',
    'cloudnet_rest:cluster_node_get',
    'global:admin',
  ]

  // check if user has required permissions
  const hasPermissions = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!node?.node?.uniqueId) {
    return <DoesNotExist name={'Node'} />
  }

  return (
    <PageLayout title={node?.node?.uniqueId}>
      <NodeClientPage node={node} nodeId={nodeId} />
    </PageLayout>
  )
}
