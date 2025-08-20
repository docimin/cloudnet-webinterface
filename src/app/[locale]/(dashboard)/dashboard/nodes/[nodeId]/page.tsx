import PageLayout from '@/components/pageLayout'
import { getPermissions } from '@/utils/server-api/getPermissions'
import NoAccess from '@/components/static/noAccess'
import DoesNotExist from '@/components/static/doesNotExist'
import NodeClientPage from '@/app/[locale]/(dashboard)/dashboard/nodes/[nodeId]/page.client'
import AutoRefresh from '@/components/autoRefresh'
import { serverNodeApi } from '@/lib/server-api'
import { getTranslations } from 'gt-next/server'

export default async function NodePage(props) {
  const params = await props.params
  const { nodeId } = params

  const navigationT = await getTranslations('Navigation')

  const node = await serverNodeApi.get(nodeId)
  const permissions: any = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:cluster_read',
    'cloudnet_rest:cluster_node_get',
    'global:admin'
  ]

  // check if user has required permissions
  const hasPermissions = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!node?.node?.uniqueId) {
    return <DoesNotExist name={navigationT('nodes')} />
  }

  return (
    <PageLayout title={node?.node?.uniqueId}>
      <AutoRefresh timer={5000}>
        <NodeClientPage node={node} nodeId={nodeId} />
      </AutoRefresh>
    </PageLayout>
  )
}
