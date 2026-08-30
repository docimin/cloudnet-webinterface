import { NextResponse } from 'next/server'
import { checkPermissions, makeApiRequest, createApiRoute } from '@/lib/api-helpers'

export const GET = createApiRoute(async () => {
  const permissionCheck = await checkPermissions([
    'cloudnet_rest:service_version_read',
    'cloudnet_rest:service_version_list',
    'global:admin'
  ])
  if (permissionCheck) return NextResponse.json(permissionCheck, { status: permissionCheck.status })

  const response = await makeApiRequest('/serviceVersion', 'GET')
  return NextResponse.json(response)
})
