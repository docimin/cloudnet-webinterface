'use server'
import { unstable_noStore } from 'next/cache';
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions';

export async function getCachedServiceLog(serviceId: string): Promise<ServiceLogCache> {
  unstable_noStore()
  const requiredPermissions = [
    'cloudnet_rest:service_read',
    'cloudnet_rest:service_log_lines',
    'global:admin',
  ]

  return await fetchWithPermissions(
    `/service/${serviceId}/logLines`,
    requiredPermissions
  )
}
