import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'

export async function getUser(userId: string) {
  const requiredPermissions = [
    'cloudnet_rest:user_read',
    'cloudnet_rest:user_get',
    'global:admin',
  ]

  return await fetchWithPermissions(`/user/${userId}/`, requiredPermissions)
}
