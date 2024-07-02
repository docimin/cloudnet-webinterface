'use server'
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'

export async function getUsers() {
  const requiredPermissions = [
    'cloudnet_rest:user_read',
    'cloudnet_rest:user_get_all',
    'global:admin',
  ]

  return await fetchWithPermissions(`/user`, requiredPermissions)
}
