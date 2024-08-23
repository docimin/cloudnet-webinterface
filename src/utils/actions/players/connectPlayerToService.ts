'use server'
import { postWithPermissions } from '@/utils/actions/postWithPermissions'

export async function connectPlayerToService(playerId: string, target: string) {
  const requiredPermissions = [
    'cloudnet_rest:player_write',
    'cloudnet_rest:player_connect_service',
    'global:admin',
  ]

  return await postWithPermissions(
    `/player/online/${playerId}/connectService?target=${target}`,
    requiredPermissions
  )
}
