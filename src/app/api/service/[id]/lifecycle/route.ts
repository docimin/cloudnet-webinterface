import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute
} from '@/lib/api-helpers'

export const PATCH = createApiRoute(async (req, { params }) => {
  const { id } = await params
  const { target } = await req.json()

  const requiredPermissions = [
    'cloudnet_rest:service_write',
    'cloudnet_rest:service_lifecycle',
    'global:admin'
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status
    })
  }

  const response = await makeApiRequest(
    `/service/${id}/lifecycle?target=${target}`,
    'PATCH'
  )
  return NextResponse.json(response)
})
