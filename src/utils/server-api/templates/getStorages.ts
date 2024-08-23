'use server'
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'
import { unstable_noStore } from 'next/cache'

export async function getStorages() {
  unstable_noStore()
  const requiredPermissions = [
    'cloudnet_rest:template_storage_read',
    'cloudnet_rest:template_storage_list',
    'global:admin',
  ]

  return await fetchWithPermissions('/templateStorage', requiredPermissions)
}
