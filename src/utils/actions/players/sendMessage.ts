'use server'
import { postWithPermissions } from '@/utils/actions/postWithPermissions'

export async function sendMessage(playerId: string, message) {
  const requiredPermissions = [
    'cloudnet_bridge:player_write',
    'cloudnet_bridge:player_send_chat',
    'global:admin',
  ]

  return await postWithPermissions(
    `/player/online/${playerId}/sendChat`,
    requiredPermissions,
    {
      chatMessage: message,
    },
    true
  )
}
