'use server'
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'
import { unstable_noStore } from 'next/cache'

export async function getGroups() {
  unstable_noStore()
  const requiredPermissions = [
    'cloudnet_rest:group_read',
    'cloudnet_rest:group_list',
    'global:admin',
  ]

  return await fetchWithPermissions('/group', requiredPermissions)
}
