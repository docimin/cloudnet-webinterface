'use server'
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'
import { unstable_noStore } from 'next/cache'

export async function getServices() {
  unstable_noStore()
  const requiredPermissions = [
    'cloudnet_rest:service_read',
    'cloudnet_rest:service_list',
    'global:admin',
  ]

  return await fetchWithPermissions('/service', requiredPermissions)
}
