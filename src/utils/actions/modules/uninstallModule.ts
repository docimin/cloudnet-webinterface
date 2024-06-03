'use server'
import { patchWithPermissions } from '@/utils/actions/patchWithPermissions'

export async function uninstallModule(moduleId: string) {
  const requiredPermissions = [
    'cloudnet_rest:module_write',
    'cloudnet_rest:module_uninstall',
    'global:admin',
  ]

  return await patchWithPermissions(
    `/module/${moduleId}/uninstall`,
    requiredPermissions
  )
}
