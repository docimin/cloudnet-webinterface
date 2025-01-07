'use server'
import { cookies } from 'next/headers'
import { getCookies } from '@/lib/server-calls'

export async function checkToken() {
  const cookie = await cookies()

  const domainUrl = new URL(process.env.NEXT_PUBLIC_DOMAIN)
  const isSecure = domainUrl.protocol === 'https:'

  const setCookie = (name: string, value: string, expiresIn: number) => {
    cookie.set(name, value, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      maxAge: Number(new Date(Date.now() + expiresIn)),
      path: '/',
    })
  }

  const currentCookies = await getCookies()
  if (!currentCookies['rt'] || !currentCookies['add']) {
    cookie.delete('add')
    cookie.delete('at')
    cookie.delete('rt')
    cookie.delete('permissions')

    return { status: 401 }
  }

  const address = decodeURIComponent(currentCookies['add'])

  // If cookies neccessary cookies do not exist, delete all and go to login page

  try {
    /**
     * Verifies if the JWT is still valid.
     */
    const accessResponse: Response = await fetch(`${address}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentCookies['at']}`,
      },
    })

    if (accessResponse.status === 200) {
      return { status: 200 }
    } else if (accessResponse.status === 401) {
      /**
       * Verifies if the JWT is still valid.
       */
      const refreshResponse: Response = await fetch(`${address}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentCookies['rt']}`,
        },
      })

      if (refreshResponse.status === 401) {
        cookie.delete('add')
        cookie.delete('at')
        cookie.delete('rt')
        cookie.delete('permissions')

        return { status: 401 }
      }

      /**
       * Refreshes both refreshToken & accessToken
       */
      const responseRefresh: Response = await fetch(`${address}/auth/refresh`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentCookies['rt']}`,
          'Content-Type': 'application/json',
        },
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

      return { status: 200 }
    }
  } catch (error) {
    cookie.delete('add')
    cookie.delete('at')
    cookie.delete('rt')
    cookie.delete('permissions')

    return { status: 401 }
  }
}
