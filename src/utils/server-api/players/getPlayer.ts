import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'
import { unstable_noStore } from 'next/cache'

export async function getPlayer(playerId: string) {
  unstable_noStore()
  const requiredPermissions = [
    'cloudnet_bridge:player_read',
    'cloudnet_bridge:player_get',
    'global:admin',
  ]

  return await fetchWithPermissions(
    `/player/online/${playerId}`,
    requiredPermissions
  )
}
