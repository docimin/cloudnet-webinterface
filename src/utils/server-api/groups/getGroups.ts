import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'

export async function getGroups() {
  const requiredPermissions = [
    'cloudnet_rest:group_read',
    'cloudnet_rest:group_list',
    'global:admin',
  ]

  return await fetchWithPermissions('/group', requiredPermissions)
}
