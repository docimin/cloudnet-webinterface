'use server'
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'
import { unstable_noStore } from 'next/cache'

export async function getTask(name: string) {
  unstable_noStore()
  const requiredPermissions = [
    'cloudnet_rest:task_read',
    'cloudnet_rest:task_get',
    'global:admin',
  ]

  return await fetchWithPermissions(`/task/${name}`, requiredPermissions)
}
