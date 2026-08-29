import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute
} from '@/lib/api-helpers'

export const POST = createApiRoute(async (req, { params }) => {
  const { storageId, prefixId, name } = await params
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path') || ''

  const requiredPermissions = [
    'cloudnet_rest:template_write',
    'cloudnet_rest:template_create',
    'global:admin'
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status
    })
  }

  const response = await makeApiRequest(
    `/template/${storageId}/${prefixId}/${name}/directory/create?path=${encodeURIComponent(path)}`,
    'POST'
  )
  return NextResponse.json(response)
})
