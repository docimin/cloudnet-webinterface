'use server'
import { postWithPermissions } from '@/utils/actions/postWithPermissions'

export async function kickPlayer(playerId: string, kickMessage) {
  const requiredPermissions = [
    'cloudnet_bridge:player_write',
    'cloudnet_bridge:player_disconnect',
    'global:admin',
  ]

  const result = await postWithPermissions(
    `/player/online/${playerId}/kick`,
    requiredPermissions,
    { kickMessage: kickMessage, },
    false
  )

  return result.status;
}
