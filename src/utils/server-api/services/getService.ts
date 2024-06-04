import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'

export async function getService(serviceId: string) {
  const requiredPermissions = [
    'cloudnet_rest:service_read',
    'cloudnet_rest:service_get',
    'global:admin',
  ]

  return await fetchWithPermissions(
    `/service/${serviceId}`,
    requiredPermissions
  )
}
