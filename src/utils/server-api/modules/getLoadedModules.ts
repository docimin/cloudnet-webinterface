'use server'
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'
import { unstable_noStore } from 'next/cache'

export async function getLoadedModules() {
  unstable_noStore()
  const requiredPermissions = [
    'cloudnet_rest:module_read',
    'cloudnet_rest:module_list_loaded',
    'global:admin',
  ]

  return await fetchWithPermissions(`/module/loaded`, requiredPermissions)
}
