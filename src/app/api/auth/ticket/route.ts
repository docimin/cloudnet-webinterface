import { NextResponse } from 'next/server'
import { makeApiRequest, createApiRoute } from '@/lib/api-helpers'

/**
 * This route is used to create a ticket for the user.
 */
export const POST = createApiRoute(async (req) => {
  const body = await req.json()
  const { type } = body

  const scopes =
    type === 'node'
      ? ['cloudnet_rest:node_live_console']
      : ['cloudnet_rest:service_live_log']

  const response = await makeApiRequest('/auth/ticket', 'POST', { scopes })
  return NextResponse.json({ secret: response.data.secret })
})
