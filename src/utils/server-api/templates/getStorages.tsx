import { fetchWithPermissions } from '@/utils/server-api/fetchWithPermissions'

export async function getStorages() {
  const requiredPermissions = [
    'cloudnet_rest:template_storage_read',
    'cloudnet_rest:template_storage_list',
    'global:admin',
  ]

  return await fetchWithPermissions('/templateStorage', requiredPermissions)
}
