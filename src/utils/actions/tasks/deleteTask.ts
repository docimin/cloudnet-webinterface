'use server'
import { deleteWithPermissions } from '@/utils/actions/deleteWithPermissions'

export async function deleteTask(taskId: string) {
  const requiredPermissions = [
    'cloudnet_rest:task_write',
    'cloudnet_rest:task_delete',
    'global:admin',
  ]

  return await deleteWithPermissions(`/task/${taskId}`, requiredPermissions)
}
