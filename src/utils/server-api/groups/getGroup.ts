'use server'
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'
import { unstable_noStore } from 'next/cache'

export async function getGroup(groupId: string) {
  unstable_noStore()
  const requiredPermissions = [
    'cloudnet_rest:group_read',
    'cloudnet_rest:group_get',
    'global:admin',
  ]

  return await fetchWithPermissions(`/group/${groupId}`, requiredPermissions)
}
