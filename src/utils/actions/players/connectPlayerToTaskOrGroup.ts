'use server'
import { postWithPermissions } from '@/utils/actions/postWithPermissions'

export async function connectPlayerToTaskOrGroup(
  playerId: string,
  target: string,
  serverSelector: string,
  type: 'task' | 'group'
) {
  const requiredPermissions = [
    'cloudnet_rest:player_write',
    'cloudnet_bridge:player_connect_group_task',
    'global:admin',
  ]

  return await postWithPermissions(
    `/player/online/${playerId}/connect?target=${target}&serverSelector=${serverSelector}&type=${type}`,
    requiredPermissions,
    {},
    true
  )
}
