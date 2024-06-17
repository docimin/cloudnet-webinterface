import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'

export async function getTask(name: string) {
  const requiredPermissions = [
    'cloudnet_rest:task_read',
    'cloudnet_rest:task_get',
    'global:admin',
  ]

  return await fetchWithPermissions(`/task/${name}`, requiredPermissions)
}
