import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'

export async function getNumberRegisteredPlayers() {
  const requiredPermissions = [
    'cloudnet_bridge:player_read',
    'cloudnet_bridge:player_registered_count',
    'global:admin',
  ]

  return await fetchWithPermissions(
    '/player/registeredCount',
    requiredPermissions
  )
}
