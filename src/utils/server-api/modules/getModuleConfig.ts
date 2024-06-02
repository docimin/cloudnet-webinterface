import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'

export async function getModuleConfig(moduleId: string) {
  const requiredPermissions = [
    'cloudnet_rest:module_read',
    'cloudnet_rest:module_list_loaded',
    'global:admin',
  ]

  return await fetchWithPermissions(
    `/module/${moduleId}/config`,
    requiredPermissions
  )
}
