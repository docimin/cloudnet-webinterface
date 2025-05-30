import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute
} from '@/lib/api-helpers'

export const POST = createApiRoute(async (req, { params }) => {
  const { id } = await params
  const requiredPermissions = [
    'cloudnet_rest:module_write',
    'cloudnet_rest:module_config_update',
    'global:admin'
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status
    })
  }

  const body = await req.json()
  const response = await makeApiRequest(`/module/${id}/config`, 'PUT', body)
  return NextResponse.json(response)
})
