'use server'
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'

export async function getNumberOnlinePlayers() {
  const requiredPermissions = [
    'cloudnet_bridge:player_read',
    'cloudnet_bridge:player_online_count',
    'global:admin',
  ]

  return await fetchWithPermissions('/player/onlineCount', requiredPermissions)
}
