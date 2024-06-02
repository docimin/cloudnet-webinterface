'use server'
import { putWithPermissions } from '@/utils/actions/putWithPermissions'

export async function updateModuleConfig(moduleId: string, body: any) {
  const requiredPermissions = [
    'cloudnet_rest:module_write',
    'cloudnet_rest:module_config',
    'global:admin',
  ]

  return await putWithPermissions(
    `/module/${moduleId}/config`,
    requiredPermissions,
    body
  )
}
