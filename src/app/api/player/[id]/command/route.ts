import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute
} from '@/lib/api-helpers'

export const POST = createApiRoute(async (req, { params }) => {
  const { id } = await params
  const { command, isProxy } = await req.json()
  const requiredPermissions = [
    'cloudnet_bridge:player_write',
    'cloudnet_bridge:player_send_command',
    'global:admin'
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status
    })
  }

  const response = await makeApiRequest(
    `/player/online/${id}/command?redirectToServer=${isProxy ? 'false' : 'true'}`,
    'POST',
    { command: command }
  )
  console.log(response.status, response.data)
  return NextResponse.json(response)
})
