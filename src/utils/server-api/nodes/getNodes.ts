'use server'
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'
import { unstable_noStore } from 'next/cache'

export async function getNodes() {
  unstable_noStore()
  const requiredPermissions = [
    'cloudnet_rest:cluster_read',
    'cloudnet_rest:cluster_node_list',
    'global:admin',
  ]

  return await fetchWithPermissions('/cluster', requiredPermissions)
}
