import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute,
} from '@/lib/api-helpers'

export const GET = createApiRoute(async (req, { params }) => {
  const requiredPermissions = [
    'cloudnet_rest:user_read',
    'cloudnet_rest:user_get',
    'global:admin',
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status,
    })
  }

  const response = await makeApiRequest(`/user/${params.id}`, 'GET')
  return NextResponse.json(response, { status: response.status })
})

export const PUT = createApiRoute(async (req, { params }) => {
  const requiredPermissions = [
    'cloudnet_rest:user_write',
    'cloudnet_rest:user_update',
    'global:admin',
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status,
    })
  }

  const body = await req.json()
  const response = await makeApiRequest(`/user/${params.id}`, 'PUT', body)
  return NextResponse.json(response, { status: response.status })
})

export const DELETE = createApiRoute(async (req, { params }) => {
  const requiredPermissions = [
    'cloudnet_rest:user_write',
    'cloudnet_rest:user_delete',
    'global:admin',
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status,
    })
  }

  const response = await makeApiRequest(`/user/${params.id}`, 'DELETE')
  return NextResponse.json(response, { status: response.status })
})
