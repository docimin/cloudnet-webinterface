'use server'
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'

export async function getLoadedModules() {
  const requiredPermissions = [
    'cloudnet_rest:module_read',
    'cloudnet_rest:module_list_loaded',
    'global:admin',
  ]

  return await fetchWithPermissions(`/module/loaded`, requiredPermissions)
}
