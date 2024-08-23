'use server'
import { postWithPermissions } from '@/utils/actions/postWithPermissions'

export async function executeCommand(
  playerId: string,
  command: string,
  isProxy: boolean = false
) {
  const requiredPermissions = [
    'cloudnet_bridge:player_write',
    'cloudnet_bridge:player_disconnect',
    'global:admin',
  ]

  const data = await postWithPermissions(
    `/player/online/${playerId}/command?redirectToServer=${isProxy ? 'false' : 'true'}`,
    requiredPermissions,
    {
      command: command,
    },
    false
  )
  return data.ok
}
