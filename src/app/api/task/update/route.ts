import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute
} from '@/lib/api-helpers'

export const POST = createApiRoute(async (req) => {
  const requiredPermissions = [
    'cloudnet_rest:task_write',
    'cloudnet_rest:task_create',
    'global:admin'
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status
    })
  }

  const body = await req.json()
  const response = await makeApiRequest('/task', 'POST', body, {
    returnJson: false,
    stringifyBody: true
  })
  return NextResponse.json(response)
})
