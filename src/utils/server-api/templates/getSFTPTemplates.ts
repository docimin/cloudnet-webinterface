'use server'
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'
import { unstable_noStore } from 'next/cache'

export async function getSFTPTemplates() {
  unstable_noStore()
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
