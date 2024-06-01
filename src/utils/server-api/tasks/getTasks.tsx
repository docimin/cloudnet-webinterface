import { fetchWithPermissions } from '@/utils/server-api/fetchWithPermissions'

export async function getTasks() {
  const requiredPermissions = [
    'cloudnet_rest:task_read',
    'cloudnet_rest:task_list',
    'global:admin',
  ]

  return await fetchWithPermissions('/task', requiredPermissions)
}
