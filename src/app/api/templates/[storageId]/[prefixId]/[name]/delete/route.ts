import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute
} from '@/lib/api-helpers'

export const POST = createApiRoute(async (req, { params }) => {
  const { storageId, prefixId, name } = await params

  const requiredPermissions = [
    'cloudnet_rest:user_write',
    'cloudnet_rest:user_delete',
    'global:admin'
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status
    })
  }

  const response = await makeApiRequest(
    `/templateStorage/${storageId}/${prefixId}/${name}`,
    'DELETE'
  )
  return NextResponse.json(response)
})
