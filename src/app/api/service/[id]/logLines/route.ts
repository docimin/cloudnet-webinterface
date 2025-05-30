import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute
} from '@/lib/api-helpers'

export const GET = createApiRoute(async (req, { params }) => {
  const { id } = await params
  const requiredPermissions = [
    'cloudnet_rest:service_read',
    'cloudnet_rest:service_log_lines',
    'global:admin'
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status
    })
  }

  const response = await makeApiRequest(`/service/${id}/logLines`, 'GET')
  return NextResponse.json(response)
})
