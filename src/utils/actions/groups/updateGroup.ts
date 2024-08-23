'use server'
import { postWithPermissions } from '@/utils/actions/postWithPermissions'

export async function updateGroup(body: any) {
  const requiredPermissions = [
    'cloudnet_rest:group_write',
    'cloudnet_rest:group_create',
    'global:admin',
  ]

  const data = await postWithPermissions(
    `/group`,
    requiredPermissions,
    body,
    false,
    true
  )
  return data.ok
}
