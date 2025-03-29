import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute,
} from '@/lib/api-helpers'

export const POST = createApiRoute(async (req) => {
  const requiredPermissions = []
  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status,
    })
  }

  const body = await req.json()
  const { type } = body

  const scopes =
    type === 'node'
      ? ['cloudnet_rest:node_live_console']
      : ['cloudnet_rest:service_live_log']

  const response = await makeApiRequest('/auth/ticket', 'POST', { scopes })
  return NextResponse.json(response, { status: response.status })
})
