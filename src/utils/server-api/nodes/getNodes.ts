'use server'
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'

export async function getNodes() {
  const requiredPermissions = [
    'cloudnet_rest:cluster_read',
    'cloudnet_rest:cluster_node_list',
    'global:admin',
  ]

  return await fetchWithPermissions('/cluster', requiredPermissions)
}
