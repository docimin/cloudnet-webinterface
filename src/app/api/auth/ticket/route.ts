import { NextResponse } from 'next/server'
import { makeApiRequest, createApiRoute } from '@/lib/api-helpers'

/**
 * This route is used to create a ticket for the user.
 */
export const POST = createApiRoute(async (req) => {
  try {
    const body = await req.json()
    const { type } = body

    const scopes =
      type === 'node'
        ? ['cloudnet_rest:node_live_console']
        : ['cloudnet_rest:service_live_log']

    // Try different request body formats based on the validation error
    let response
    try {
      // First try the original format
      response = await makeApiRequest('/auth/ticket', 'POST', { scopes })
    } catch (error) {
      try {
        // Try nested format based on the error path
        response = await makeApiRequest('/auth/ticket', 'POST', { arg1: { scopes } })
      } catch (error2) {
        try {
          // Try with body wrapper
          response = await makeApiRequest('/auth/ticket', 'POST', { body: { scopes } })
        } catch (error3) {
          // Try with scopes array directly
          response = await makeApiRequest('/auth/ticket', 'POST', scopes)
        }
      }
    }
    
    // Handle different response structures and extract a serializable ticket string
    let secret: string | undefined
    const dataAny: any = (response as any).data
    if (typeof dataAny === 'string') {
      secret = dataAny
    } else if (dataAny && typeof dataAny === 'object' && 'secret' in dataAny) {
      secret = dataAny.secret as string
    } else if (
      dataAny &&
      typeof dataAny === 'object' &&
      'data' in dataAny &&
      dataAny.data &&
      typeof dataAny.data === 'object' &&
      'secret' in dataAny.data
    ) {
      secret = dataAny.data.secret as string
    }
    // Fallback: if response.data is directly a string
    if (!secret && typeof dataAny === 'string') {
      secret = dataAny
    }
    
    if (!secret || typeof secret !== 'string') {
      throw new Error('No secret found in response')
    }
    
    return NextResponse.json(secret)
  } catch (error) {
    throw error
  }
})
