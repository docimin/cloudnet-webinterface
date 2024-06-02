import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'

export async function getModule(moduleId: string) {
  const requiredPermissions = [
    'cloudnet_rest:module_read',
    'cloudnet_rest:module_get',
    'global:admin',
  ]

  return await fetchWithPermissions(`/module/${moduleId}`, requiredPermissions)
}
