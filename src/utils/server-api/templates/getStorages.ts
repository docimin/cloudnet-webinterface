'use server'
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'

export async function getStorages() {
  const requiredPermissions = [
    'cloudnet_rest:template_storage_read',
    'cloudnet_rest:template_storage_list',
    'global:admin',
  ]

  return await fetchWithPermissions('/templateStorage', requiredPermissions)
}
