import { NextResponse } from 'next/server'
import { checkPermissions, makeApiRequest, createApiRoute } from '@/lib/api-helpers'

// ?remove=true|false — whether to clear the pending deployments afterwards
export const POST = createApiRoute(async (req, { params }) => {
  const permissionCheck = await checkPermissions([
    'cloudnet_rest:service_write',
    'cloudnet_rest:service_deploy_resources',
    'global:admin'
  ])
  if (permissionCheck) return NextResponse.json(permissionCheck, { status: permissionCheck.status })

  const { id } = await params
  const { searchParams } = new URL(req.url)
  const remove = searchParams.get('remove') !== 'false'

  const res = await makeApiRequest(
    `/service/${id}/deployResources?remove=${remove}`,
    'POST',
    undefined,
    { returnJson: false }
  )
  if (res.status === 204) return new NextResponse(null, { status: 204 })
  return NextResponse.json(res, { status: res.status })
})
