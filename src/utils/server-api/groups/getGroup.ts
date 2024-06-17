import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'

export async function getGroup(groupId: string) {
  const requiredPermissions = [
    'cloudnet_rest:group_read',
    'cloudnet_rest:group_get',
    'global:admin',
  ]

  return await fetchWithPermissions(`/group/${groupId}`, requiredPermissions)
}
