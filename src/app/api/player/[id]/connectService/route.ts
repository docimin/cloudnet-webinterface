import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute
} from '@/lib/api-helpers'

export const POST = createApiRoute(async (req, { params }) => {
  const { id } = await params
  const { target } = await req.json()

  const requiredPermissions = [
    'cloudnet_bridge:player_write',
    'cloudnet_bridge:player_connect_service',
    'global:admin'
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status
    })
  }

  const response = await makeApiRequest(
    `/player/online/${id}/connectService?target=${encodeURIComponent(target)}`,
    'POST'
  )
  return NextResponse.json(response)
})
