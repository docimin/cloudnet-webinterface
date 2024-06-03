import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'

export async function getS3Templates() {
  const requiredPermissions = [
    'cloudnet_rest:template_storage_read',
    'cloudnet_rest:template_storage_template_list',
    'global:admin',
  ]

  return await fetchWithPermissions(
    '/templateStorage/s3/templates',
    requiredPermissions
  )
}
