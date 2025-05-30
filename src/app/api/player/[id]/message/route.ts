import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute
} from '@/lib/api-helpers'

export const POST = createApiRoute(async (req, { params }) => {
  const { id } = await params
  const { message } = await req.json()

  const requiredPermissions = [
    'cloudnet_bridge:player_write',
    'cloudnet_bridge:player_message',
    'global:admin'
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status
    })
  }

  const response = await makeApiRequest(
    `/player/online/${id}/sendChat`,
    'POST',
    {
      chatMessage: message
    }
  )
  return NextResponse.json(response)
})
