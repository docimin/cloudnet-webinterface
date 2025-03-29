import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute,
} from '@/lib/api-helpers'

export const DELETE = createApiRoute(async (req, { params }) => {
  const requiredPermissions = [
    'cloudnet_rest:group_write',
    'cloudnet_rest:group_delete',
    'global:admin',
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status,
    })
  }

  const response = await makeApiRequest(`/group/${params.id}`, 'DELETE')
  return NextResponse.json(response, { status: response.status })
})
