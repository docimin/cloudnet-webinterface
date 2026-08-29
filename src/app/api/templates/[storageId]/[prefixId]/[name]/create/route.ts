import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute
} from '@/lib/api-helpers'

export const POST = createApiRoute(async (_req, { params }) => {
  const { storageId, prefixId, name } = await params

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
    `/template/${storageId}/${prefixId}/${name}/create`,
    'POST'
  )
  return NextResponse.json(response)
})
