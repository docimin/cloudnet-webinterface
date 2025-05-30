import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute
} from '@/lib/api-helpers'

export const GET = createApiRoute(async (req, { params }) => {
  const { storageId, prefixId, name } = await params
  const body = await req.json()
  const { filePath, content } = body

  const requiredPermissions = [
    'cloudnet_rest:template_write',
    'cloudnet_rest:template_file_write',
    'global:admin'
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status
    })
  }

  const response = await makeApiRequest(
    `/template/${storageId}/${prefixId}/${name}/file`,
    'PUT',
    { filePath, content }
  )
  return NextResponse.json(response)
})
