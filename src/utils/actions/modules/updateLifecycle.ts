'use server'
import { patchWithPermissions } from '@/utils/actions/patchWithPermissions'

export async function updateLifecycle(moduleId: string, body: any) {
  const requiredPermissions = [
    'cloudnet_rest:module_write',
    'cloudnet_rest:module_lifecycle',
    'global:admin',
  ]

  return await patchWithPermissions(
    `/module/${moduleId}/lifecycle?target=${body.lifecycle}`,
    requiredPermissions
  )
}
