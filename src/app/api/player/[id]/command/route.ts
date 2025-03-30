import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute,
} from '@/lib/api-helpers'

export const POST = createApiRoute(async (req, { params }) => {
  const { id } = await params
  const requiredPermissions = [
    'cloudnet_bridge:player_write',
    'cloudnet_bridge:player_send_command',
    'global:admin',
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status,
    })
  }

  const body = await req.json()
  const response = await makeApiRequest(
    `/player/online/${id}/command`,
    'POST',
    body
  )
  return NextResponse.json(response)
})
