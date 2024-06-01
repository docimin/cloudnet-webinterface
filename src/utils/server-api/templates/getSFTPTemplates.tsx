import { fetchWithPermissions } from '@/utils/server-api/fetchWithPermissions'

export async function getSFTPTemplates() {
  const requiredPermissions = [
    'cloudnet_rest:template_storage_read',
    'cloudnet_rest:template_storage_template_list',
    'global:admin',
  ]

  return await fetchWithPermissions(
    '/templateStorage/sftp/templates',
    requiredPermissions
  )
}
