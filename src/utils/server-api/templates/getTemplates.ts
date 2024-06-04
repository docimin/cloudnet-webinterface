import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'

export async function getTemplates(storageId: string) {
  const requiredPermissions = [
    'cloudnet_rest:template_storage_read',
    'cloudnet_rest:template_storage_template_list',
    'global:admin',
  ]

  return await fetchWithPermissions(
    `/templateStorage/${storageId}/templates`,
    requiredPermissions
  )
}
