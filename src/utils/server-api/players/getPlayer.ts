import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'

export async function getPlayer(playerId: string) {
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
