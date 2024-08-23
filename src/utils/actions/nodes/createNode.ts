'use server'
import { postWithPermissions } from '@/utils/actions/postWithPermissions'

export async function uninstallModule(moduleId: string) {
  const requiredPermissions = [
    'cloudnet_rest:module_write',
    'cloudnet_rest:module_uninstall',
    'global:admin',
  ]

  return await postWithPermissions(
    `/module/${moduleId}/uninstall`,
    requiredPermissions
  )
}
