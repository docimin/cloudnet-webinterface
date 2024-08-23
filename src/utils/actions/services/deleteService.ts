'use server'
import { deleteWithPermissions } from '@/utils/actions/deleteWithPermissions'

export async function deleteService(serviceId: string) {
  const requiredPermissions = [
    'cloudnet_rest:service_write',
    'cloudnet_rest:service_delete',
    'global:admin',
  ]

  return await deleteWithPermissions(
    `/service/${serviceId}`,
    requiredPermissions
  )
}
