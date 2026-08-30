import { NextResponse } from 'next/server'
import { checkPermissions, makeApiRequest, createApiRoute } from '@/lib/api-helpers'

// DESTRUCTIVE — proxies DELETE /service/{id}/deleteFiles which wipes the
// service's ENTIRE runtime tree (still keeps CloudNet wrapper metadata).
// The panel gates this behind an explicit confirm dialog.
export const POST = createApiRoute(async (_req, { params }) => {
  const permissionCheck = await checkPermissions([
    'cloudnet_rest:service_write',
    'cloudnet_rest:service_delete_files',
    'global:admin'
  ])
  if (permissionCheck) return NextResponse.json(permissionCheck, { status: permissionCheck.status })

  const { id } = await params
  const res = await makeApiRequest(
    `/service/${id}/deleteFiles`,
    'DELETE',
    undefined,
    { returnJson: false }
  )
  if (res.status === 204) return new NextResponse(null, { status: 204 })
  return NextResponse.json(res, { status: res.status })
})
