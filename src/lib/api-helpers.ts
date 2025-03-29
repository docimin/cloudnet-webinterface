import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export type ApiResponse<T = any> = {
  success?: boolean
  data?: T
  error?: string
  status: number
}

export async function checkPermissions(
  requiredPermissions: string[]
): Promise<ApiResponse | null> {
  const cookie = await cookies()
  const perms = cookie.get('permissions')?.value
  const permissions = perms ? JSON.parse(perms) : []

  if (
    !requiredPermissions.some((permission) => permissions.includes(permission))
  ) {
    return { status: 401, error: 'Unauthorized' }
  }

  const accessToken = cookie.get('at')?.value
  const address = cookie.get('add')?.value

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
  const cookie = await cookies()
  const accessToken = cookie.get('at')?.value
  const address = cookie.get('add')?.value

  if (!accessToken || !address) {
    throw new Error('Unauthorized')
  }

  try {
    const response = await fetch(`${decodeURIComponent(address)}${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: options.stringifyBody !== false ? JSON.stringify(body) : body,
      next: {
        revalidate: 0,
      },
    })

    const responseText = await response.text()

    try {
      const data = JSON.parse(responseText)
      return {
        data: data.data || data,
        status: response.status,
      }
    } catch (e) {
      return {
        data: responseText as unknown as T,
        status: response.status,
      }
    }
  } catch (error) {
    throw error
  }
}

type RouteHandler = (
  req: Request,
  context: { params: { [key: string]: string } }
) => Promise<Response>

export function createApiRoute(handler: RouteHandler) {
  return async (
    req: Request,
    context: { params: { [key: string]: string } }
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
