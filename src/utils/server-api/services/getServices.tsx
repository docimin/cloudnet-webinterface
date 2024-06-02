import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'

export async function getServices() {
  const requiredPermissions = [
    'cloudnet_rest:service_read',
    'cloudnet_rest:service_list',
    'global:admin',
  ]

  return await fetchWithPermissions('/service', requiredPermissions)
}
