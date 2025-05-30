import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute
} from '@/lib/api-helpers'

export const POST = createApiRoute(async (req, { params }) => {
  const { id } = await params
  const { target } = await req.json()

  const requiredPermissions = [
    'cloudnet_rest:module_write',
    'cloudnet_rest:module_lifecycle',
    'global:admin'
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status
    })
  }

  console.log(target)
  const response = await makeApiRequest(
    `/module/${id}/lifecycle?target=${target}`,
    'PATCH'
  )
  console.log(response)
  return NextResponse.json(response)
})
