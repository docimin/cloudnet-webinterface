import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute,
} from '@/lib/api-helpers'

export const GET = createApiRoute(async (req, { params }) => {
  const requiredPermissions = [
    'cloudnet_rest:service_read',
    'cloudnet_rest:service_get',
    'global:admin',
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status,
    })
  }

  const response = await makeApiRequest(`/service/${params.id}`, 'GET')
  return NextResponse.json(response, { status: response.status })
})
