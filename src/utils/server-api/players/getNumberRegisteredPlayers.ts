'use server'
import { fetchWithPermissions } from '@/utils/actions/fetchWithPermissions'
import { unstable_noStore } from 'next/cache'

export async function getNumberRegisteredPlayers() {
  unstable_noStore()
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
