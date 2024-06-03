'use server'
import { putWithPermissions } from '@/utils/actions/putWithPermissions'

export async function updateUser(userId: string, body: any) {
  const requiredPermissions = [
    'cloudnet_rest:user_write',
    'cloudnet_rest:user_update',
    'global:admin',
  ]

  return await putWithPermissions(`/user/${userId}`, requiredPermissions, body)
}
