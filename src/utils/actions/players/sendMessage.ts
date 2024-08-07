'use server'
import { postWithPermissions } from '@/utils/actions/postWithPermissions'

export async function sendMessage(playerId: string, message) {
  const requiredPermissions = [
    'cloudnet_bridge:player_write',
    'cloudnet_bridge:player_send_chat',
    'global:admin',
  ]

  const data = await postWithPermissions(
    `/player/online/${playerId}/sendChat`,
    requiredPermissions,
    {
      chatMessage: message,
    }
  )
  return JSON.stringify(data)
}
