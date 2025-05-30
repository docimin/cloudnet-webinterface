import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCookies } from '@/lib/server-calls'
import { createApiRoute } from '@/lib/api-helpers'

/**
 * This route is used to verify the JWT token and refresh it if it is expired.
 */
export const POST = createApiRoute(async () => {
  const cookie = await cookies()
  const domainUrl = new URL(process.env.NEXT_PUBLIC_DOMAIN)
  const isSecure = domainUrl.protocol === 'https:'

  const setCookie = (name: string, value: string, expiresIn: number) => {
    cookie.set(name, value, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      maxAge: Number(new Date(Date.now() + expiresIn)),
      path: '/'
    })
  }

  const currentCookies = await getCookies()
  if (!currentCookies['rt'] || !currentCookies['add']) {
    cookie.delete('add')
    cookie.delete('at')
    cookie.delete('rt')
    cookie.delete('permissions')

    return NextResponse.json(
      { status: 401, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const address = decodeURIComponent(currentCookies['add'])

  try {
    // Verify if the JWT is still valid
    const accessResponse = await fetch(`${address}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentCookies['at']}`
      }
    })

    if (accessResponse.status === 200) {
      return NextResponse.json({ status: 200 })
    } else if (accessResponse.status === 401) {
      // Verify if the refresh token is still valid
      const refreshResponse = await fetch(`${address}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentCookies['rt']}`
        }
      })

      if (refreshResponse.status === 401) {
        cookie.delete('add')
        cookie.delete('at')
        cookie.delete('rt')
        cookie.delete('permissions')

        return NextResponse.json(
          { status: 401, error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Refresh both refreshToken & accessToken
      const responseRefresh = await fetch(`${address}/auth/refresh`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentCookies['rt']}`,
          'Content-Type': 'application/json'
        }
      })

      const dataResponse = await responseRefresh.json()

      const expirationAccessTime = Number(
        new Date(Date.now() + dataResponse.accessToken.expiresIn)
      )
      const expirationRefreshTime = Number(
        new Date(Date.now() + dataResponse.refreshToken.expiresIn)
      )

      setCookie('add', address, dataResponse.refreshToken.expiresIn)
      setCookie('at', dataResponse.accessToken.token, expirationAccessTime)
      setCookie('rt', dataResponse.refreshToken.token, expirationRefreshTime)
      setCookie(
        'permissions',
        JSON.stringify(dataResponse.scopes),
        expirationAccessTime
      )

      return NextResponse.json({ status: 200 })
    } else {
      // Handle any other status codes
      return NextResponse.json(
        { status: accessResponse.status, error: 'Authentication failed' },
        { status: accessResponse.status }
      )
    }
  } catch (error) {
    cookie.delete('add')
    cookie.delete('at')
    cookie.delete('rt')
    cookie.delete('permissions')

    return NextResponse.json(
      { status: 401, error: 'Unauthorized' },
      { status: 401 }
    )
  }
})
