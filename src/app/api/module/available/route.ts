import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute
} from '@/lib/api-helpers'

export const GET = createApiRoute(async () => {
  const requiredPermissions = [
    'cloudnet_rest:module_read',
    'cloudnet_rest:module_list_available',
    'global:admin'
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status
    })
  }

  const response = await makeApiRequest(`/module/available`, 'GET')
  return NextResponse.json(response)
})
