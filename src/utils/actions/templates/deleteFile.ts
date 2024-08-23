'use server'
import { deleteWithPermissions } from '@/utils/actions/deleteWithPermissions'

export async function deleteFile(
  storageId: string,
  storagePrefix: string,
  templateId,
  fileId: string[]
) {
  const requiredPermissions = [
    'cloudnet_rest:template_write',
    'cloudnet_rest:template_delete_file',
    'global:admin',
  ]

  // Skip the first element and join the rest with '/'
  const directory = (fileId && fileId.join('/')) || ''

  return await deleteWithPermissions(
    `/template/${storageId}/${storagePrefix}/${templateId}/file?path=${directory}`,
    requiredPermissions
  )
}
