import { fetchWithPermissions } from '@/utils/server-api/fetchWithPermissions'

export async function getServices() {
  const requiredPermissions = [
    'cloudnet_rest:service_read',
    'cloudnet_rest:service_list',
    'global:admin',
  ]

  return await fetchWithPermissions('/service', requiredPermissions)
}
