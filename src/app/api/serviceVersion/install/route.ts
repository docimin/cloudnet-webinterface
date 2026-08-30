import { NextResponse } from 'next/server'
import { checkPermissions, makeApiRequest, createApiRoute } from '@/lib/api-helpers'

// Body: { template: {prefix, name, storage}, serviceVersionType, serviceVersion }
export const POST = createApiRoute(async (req) => {
  const permissionCheck = await checkPermissions([
    'cloudnet_rest:service_version_write',
    'cloudnet_rest:service_version_install',
    'global:admin'
  ])
  if (permissionCheck) return NextResponse.json(permissionCheck, { status: permissionCheck.status })

  const body = await req.json()
  const { searchParams } = new URL(req.url)
  const force = searchParams.get('force') === 'true' ? '&force=true' : ''
  const cache = searchParams.get('cache') !== 'false' ? '&cache=true' : '&cache=false'

  const response = await makeApiRequest(
    `/serviceVersion/install?${force.slice(1)}${cache}`,
    'POST',
    body,
    { returnJson: false, stringifyBody: true }
  )
  return NextResponse.json(response)
})
