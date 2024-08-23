'use server'
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'
import { unstable_noStore } from 'next/cache'

export async function getService(serviceId: string) {
  unstable_noStore()
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
