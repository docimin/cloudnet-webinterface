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
  const url = `/template/${storageId}/${storagePrefix}/${templateId}/file/download?path=${directory}`

  return await fetchWithPermissionsAsText(url, requiredPermissions)
}
