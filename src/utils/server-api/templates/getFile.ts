'use server'
import { fetchWithPermissionsAsText } from '@/utils/actions/fetchWithPermissionsAsText'

export async function getFile(
  storageId: string,
  storagePrefix: string,
  templateId: string,
  params: string[]
) {
  const requiredPermissions = [
    'cloudnet_rest:template_storage_read',
    'cloudnet_rest:template_storage_template_list',
    'global:admin',
  ]

  // Skip the first element and join the rest with '/'
  const directory = params.join('/')

  return await fetchWithPermissionsAsText(
    `/template/${storageId}/${storagePrefix}/${templateId}/file/download?path=${directory}`,
    requiredPermissions
  )
}
