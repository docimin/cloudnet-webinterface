import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute
} from '@/lib/api-helpers'

export const POST = createApiRoute(async (req) => {
  const requiredPermissions = [
    'cloudnet_rest:group_write',
    'cloudnet_rest:group_update',
    'global:admin'
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status
    })
  }

  const body = await req.json()
  const response = await makeApiRequest(`/group`, 'POST', body, {
    returnJson: false,
    stringifyBody: true
  })
  return NextResponse.json(response)
})
