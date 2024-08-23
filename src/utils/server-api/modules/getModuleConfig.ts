'use server'
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'
import { unstable_noStore } from 'next/cache'

export async function getModuleConfig(moduleId: string) {
  unstable_noStore()
  const requiredPermissions = [
    'cloudnet_rest:module_read',
    'cloudnet_rest:module_config_get',
    'global:admin',
  ]

  return await fetchWithPermissions(
    `/module/${moduleId}/config`,
    requiredPermissions
  )
}
