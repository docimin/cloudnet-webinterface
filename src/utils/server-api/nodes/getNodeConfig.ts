import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'

export async function getNodeConfig(moduleId: string) {
  const requiredPermissions = [
    'cloudnet_rest:node_read',
    'cloudnet_rest:node_config_get',
    'global:admin',
  ]

  return await fetchWithPermissions(
    `/module/${moduleId}/config`,
    requiredPermissions
  )
}
