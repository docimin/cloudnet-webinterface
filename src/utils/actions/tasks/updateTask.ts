'use server'
import { postWithPermissions } from '@/utils/actions/postWithPermissions'

export async function updateTask(taskId: string, body: any) {
  const requiredPermissions = [
    'cloudnet_rest:task_write',
    'cloudnet_rest:task_create',
    'global:admin',
  ]

  const data = await postWithPermissions(
    `/task`,
    requiredPermissions,
    body,
    false,
    false
  )
  return data.ok
}
