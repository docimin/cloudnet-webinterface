import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    // Delete all cookies
    const domainUrl = new URL(
      process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost'
    )
    const domain = domainUrl.hostname.startsWith('www.')
      ? domainUrl.hostname.slice(4)
      : domainUrl.hostname

    const setCookie = (name: string, value: string) => {
      cookies().set(name, value, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
        domain: domain,
      })
    }

    setCookie('add', '')
    setCookie('at', '')
    setCookie('rt', '')
    setCookie('permissions', '')

    return NextResponse.json({ status: 204 })
  } catch (error) {
    return NextResponse.json({ error: error.message, status: error.code })
  }
}
