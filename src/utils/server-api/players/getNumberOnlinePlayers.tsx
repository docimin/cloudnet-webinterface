import { fetchWithPermissions } from '@/utils/server-api/fetchWithPermissions'

export async function getNumberOnlinePlayers() {
  const requiredPermissions = [
    'cloudnet_bridge:player_read',
    'cloudnet_bridge:player_online_count',
    'global:admin',
  ]

  return await fetchWithPermissions('/player/onlineCount', requiredPermissions)
}
