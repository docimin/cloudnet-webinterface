'use server'
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'
import { unstable_noStore } from 'next/cache'

export async function getModule(moduleId: string) {
  unstable_noStore()
  const requiredPermissions = [
    'cloudnet_rest:module_read',
    'cloudnet_rest:module_get',
    'global:admin',
  ]

  return await fetchWithPermissions(`/module/${moduleId}`, requiredPermissions)
}
