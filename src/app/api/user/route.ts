import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute,
} from '@/lib/api-helpers'

export const GET = createApiRoute(async (req) => {
  const requiredPermissions = [
    'cloudnet_rest:user_read',
    'cloudnet_rest:user_list',
    'global:admin',
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status,
    })
  }

  const response = await makeApiRequest('/user', 'GET')
  return NextResponse.json(response, { status: response.status })
})

export const POST = createApiRoute(async (req) => {
  const requiredPermissions = [
    'cloudnet_rest:user_write',
    'cloudnet_rest:user_create',
    'global:admin',
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status,
    })
  }

  const body = await req.json()
  const response = await makeApiRequest('/user', 'POST', body)
  return NextResponse.json(response, { status: response.status })
})
