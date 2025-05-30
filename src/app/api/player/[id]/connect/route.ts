import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute
} from '@/lib/api-helpers'

export const POST = createApiRoute(async (req, { params }) => {
  const { id } = await params
  const { target, serverSelector, type } = await req.json()

  const requiredPermissions = [
    'cloudnet_bridge:player_write',
    'cloudnet_bridge:player_connect_group_task',
    'global:admin'
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status
    })
  }

  const response = await makeApiRequest(
    `/player/online/${id}/connect?target=${encodeURIComponent(target)}&serverSelector=${encodeURIComponent(serverSelector)}&type=${encodeURIComponent(type)}`,
    'POST'
  )
  return NextResponse.json(response)
})
