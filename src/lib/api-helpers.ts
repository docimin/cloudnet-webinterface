import { NextRequest, NextResponse } from 'next/server'
import { getCookies } from '@/lib/server-calls'
import { cookies } from 'next/headers'
import { captureException } from '@sentry/nextjs'

export type ApiResponse<T = any> = {
  success?: boolean
  data?: T
  error?: string
  status: number
}

export async function checkPermissions(
  requiredPermissions: string[]
): Promise<ApiResponse | null> {
  const cookies = await getCookies()
  const perms = cookies['permissions']
  const permissions = perms ? JSON.parse(decodeURIComponent(perms)) : []

  if (
    !requiredPermissions.some((permission) => permissions.includes(permission))
  ) {
    return { status: 401, error: 'Unauthorized' }
  }

  const accessToken = cookies['at']
  const address = cookies['add']

  if (!accessToken || !address) {
    return { status: 401, error: 'Unauthorized' }
  }

  return null
}

export async function makeApiRequest<T = any>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: any,
  options: {
    returnJson?: boolean
    stringifyBody?: boolean
  } = {}
): Promise<{ data: T; status: number }> {
  const cookies = await getCookies()
  const accessToken = cookies['at']
  const address = cookies['add']

  if (!accessToken || !address) {
    throw new Error('Unauthorized')
  }

  try {
    const fullUrl = `${decodeURIComponent(address)}${url}`
    
    const response = await fetch(fullUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: options.stringifyBody !== false ? JSON.stringify(body) : body,
      next: {
        revalidate: 0
      }
    })
    
    const responseText = await response.text()

    try {
      const data = JSON.parse(responseText)
      
      return {
        data: data.data || data,
        status: response.status
      }
    } catch (e) {
      return {
        data: responseText as unknown as T,
        status: response.status
      }
    }
  } catch (error) {
    captureException(error)
    throw error
  }
}

type RouteHandler = (
  req: NextRequest,
  context: { params: Promise<{ [key: string]: string }> }
) => Promise<NextResponse>

export function createApiRoute(handler: RouteHandler) {
  return async (
    req: NextRequest,
    context: { params: Promise<{ [key: string]: string }> }
  ) => {
    try {
      const response = await handler(req, context)
      return response
    } catch (error) {
      return NextResponse.json(
        { error: error.message || 'Internal Server Error' },
        { status: error.status || 500 }
      )
    }
  }
}
