'use server'
import { postWithPermissions } from '@/utils/actions/postWithPermissions'

export async function updateFile(
  storageId: string,
  storagePrefix: string,
  templateId,
  fileId: string[],
  body: any
) {
  const requiredPermissions = [
    'cloudnet_rest:template_write',
    'cloudnet_rest:template_file_append',
    'global:admin',
  ]

  // Skip the first element and join the rest with '/'
  const directory = (fileId && fileId.join('/')) || ''

  const data = await postWithPermissions(
    `/template/${storageId}/${storagePrefix}/${templateId}/file/create?path=${directory}`,
    requiredPermissions,
    body,
    false,
    false
  )
  return data.ok
}
