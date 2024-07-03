'use server'
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'
import { unstable_noStore } from 'next/cache'

export async function getUser(userId: string) {
  unstable_noStore()
  const requiredPermissions = [
    'cloudnet_rest:user_read',
    'cloudnet_rest:user_get',
    'global:admin',
  ]

  return await fetchWithPermissions(`/user/${userId}/`, requiredPermissions)
}
