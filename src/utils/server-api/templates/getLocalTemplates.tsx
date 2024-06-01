import { fetchWithPermissions } from '@/utils/server-api/fetchWithPermissions'

export async function getLocalTemplates() {
  const requiredPermissions = [
    'cloudnet_rest:template_storage_read',
    'cloudnet_rest:template_storage_template_list',
    'global:admin',
  ]

  return await fetchWithPermissions(
    '/templateStorage/local/templates',
    requiredPermissions
  )
}
