import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * This route is used to logout the user and delete all cookies.
 */
export async function POST() {
  const cookie = await cookies()
  try {
    // Delete all cookies
    const domainUrl = new URL(process.env.NEXT_PUBLIC_DOMAIN)
    const isSecure = domainUrl.protocol === 'https:'

    const setCookie = async (name: string, value: string) => {
      cookie.set(name, value, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      })
    }

    await setCookie('add', '')
    await setCookie('at', '')
    await setCookie('rt', '')
    await setCookie('permissions', '')

    return NextResponse.json({ status: 204 })
  } catch (error) {
    return NextResponse.json({ error: error.message, status: error.code })
  }
}
