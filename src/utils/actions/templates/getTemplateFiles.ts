'use server'
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'

export async function getTemplateFiles(
  storageId: string,
  storagePrefix: string,
  templateId,
  fileId: string[]
) {
  const requiredPermissions = [
    'cloudnet_rest:template_storage_read',
    'cloudnet_rest:template_storage_template_list',
    'global:admin',
  ]

  // Skip the first element and join the rest with '/'
  const directory = (fileId && fileId.join('/')) || ''

  return await fetchWithPermissions(
    `/template/${storageId}/${storagePrefix}/${templateId}/directory/list?deep=true&directory=${directory}`,
    requiredPermissions
  )
}
