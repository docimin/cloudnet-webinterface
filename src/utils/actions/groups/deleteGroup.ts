'use server'
import { deleteWithPermissions } from '@/utils/actions/deleteWithPermissions'

export async function deleteGroup(groupId: string) {
  const requiredPermissions = [
    'cloudnet_rest:group_write',
    'cloudnet_rest:group_delete',
    'global:admin',
  ]

  return await deleteWithPermissions(`/group/${groupId}`, requiredPermissions)
}
