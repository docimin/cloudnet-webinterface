'use server'
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'
import { unstable_noStore } from 'next/cache'

export async function getTasks() {
  unstable_noStore()
  const requiredPermissions = [
    'cloudnet_rest:task_read',
    'cloudnet_rest:task_list',
    'global:admin',
  ]

  return await fetchWithPermissions('/task', requiredPermissions)
}
