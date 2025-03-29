import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute,
} from '@/lib/api-helpers'

export const POST = createApiRoute(async (req) => {
  const requiredPermissions = [
    'cloudnet_rest:command_write',
    'cloudnet_rest:command_execute',
    'global:admin',
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status,
    })
  }

  const body = await req.json()
  const response = await makeApiRequest('/command', 'POST', body)
  return NextResponse.json(response, { status: response.status })
})
