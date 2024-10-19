'use server'
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'
import { unstable_noStore } from 'next/cache'

export async function getListOnlinePlayers(offset: number) {
  unstable_noStore()
  const requiredPermissions = [
    'cloudnet_bridge:player_read',
    'cloudnet_bridge:player_get_bulk',
    'global:admin',
  ]

  return await fetchWithPermissions(
    `/player/online?limit=25&sort=asc&offset=${offset}`,
    requiredPermissions
  )
}
