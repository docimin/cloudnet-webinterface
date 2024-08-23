'use server'
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'
import { unstable_noStore } from 'next/cache'

export async function getNode(nodeId: string) {
  unstable_noStore()
  const requiredPermissions = [
    'cloudnet_rest:cluster_read',
    'cloudnet_rest:cluster_node_get',
    'global:admin',
  ]

  return await fetchWithPermissions(`/cluster/${nodeId}`, requiredPermissions)
}
