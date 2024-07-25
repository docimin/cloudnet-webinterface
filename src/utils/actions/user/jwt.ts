'use server'
import { cookies } from 'next/headers'
import { getCookies } from '@/lib/server-calls'

export async function checkToken() {
  const setCookie = (name: string, value: string, expiresIn: number) => {
    cookies().set(name, value, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: Number(new Date(Date.now() + expiresIn)),
      path: '/',
    })
  }

  const cookie = await getCookies()
  if (!cookie['rt'] || !cookie['add']) {
    cookies().delete('add')
    cookies().delete('at')
    cookies().delete('rt')
    cookies().delete('permissions')

    return { status: 401 }
  }

  const address = decodeURIComponent(cookie['add'])

  // If cookies neccessary cookies do not exist, delete all and go to login page

  try {
    /**
     * Verifies if the JWT is still valid.
     */
    const accessResponse: Response = await fetch(`${address}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cookie['at']}`,
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
          Authorization: `Bearer ${cookie['rt']}`,
        },
      })

      if (refreshResponse.status === 401) {
        cookies().delete('add')
        cookies().delete('at')
        cookies().delete('rt')
        cookies().delete('permissions')

        return { status: 401 }
      }

      /**
       * Refreshes both refreshToken & accessToken
       */
      const responseRefresh: Response = await fetch(`${address}/auth/refresh`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cookie['rt']}`,
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
    cookies().delete('add')
    cookies().delete('at')
    cookies().delete('rt')
    cookies().delete('permissions')

    return { status: 401 }
  }
}
