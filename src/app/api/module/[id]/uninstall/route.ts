import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute,
} from '@/lib/api-helpers'

export const POST = createApiRoute(async (req, { params }) => {
  const requiredPermissions = [
    'cloudnet_rest:module_write',
    'cloudnet_rest:module_uninstall',
    'global:admin',
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status,
    })
  }

  const response = await makeApiRequest(
    `/module/${params.id}/uninstall`,
    'POST',
    {}
  )
  return NextResponse.json(response, { status: response.status })
})
