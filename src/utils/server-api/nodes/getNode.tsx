import { fetchWithPermissions } from '@/utils/server-api/fetchWithPermissions'

export async function getNode(nodeId: string) {
  const requiredPermissions = [
    'cloudnet_rest:cluster_read',
    'cloudnet_rest:cluster_node_get',
    'global:admin',
  ]

  return await fetchWithPermissions(`/cluster/${nodeId}`, requiredPermissions)
}
