import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute
} from '@/lib/api-helpers'

export const DELETE = createApiRoute(async (req, { params }) => {
  const { storageId, prefixId, name } = await params
  const body = await req.json()
  const { filePath } = body

  const requiredPermissions = [
    'cloudnet_rest:template_write',
    'cloudnet_rest:template_delete_file',
    'global:admin'
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status
    })
  }

  // Join the filePath array with '/' to create the path parameter
  const path = filePath.join('/')

  const response = await makeApiRequest(
    `/template/${storageId}/${prefixId}/${name}/file?path=${path}`,
    'DELETE'
  )
  return NextResponse.json(response)
})
