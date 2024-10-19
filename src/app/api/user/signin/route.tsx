import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  if (request.headers.get('content-type') !== 'application/json') {
    return NextResponse.json({ error: 'Invalid content type', status: 400 })
  }

  if (!request.body) {
    return NextResponse.json({ error: 'No body provided', status: 400 })
  }

  const domainUrl = new URL(process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost')
  const domain = domainUrl.hostname.startsWith('www.')
    ? domainUrl.hostname.slice(4)
    : domainUrl.hostname

  const setCookie = (name: string, value: string, expiresIn: number) => {
    cookies().set(name, value, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: Number(new Date(Date.now() + expiresIn)),
      path: '/',
      domain: domain,
    })
  }

  const { address, username, password } = await request.json() as { address: string, username: string, password: string }

  const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]{1,5})?$/

  let formattedAddress = address
  if (ipPattern.test(address)) {
    if (!address.startsWith('http://')) {
      formattedAddress = 'http://' + address
    }
  } else {
    if (address.startsWith('http://')) {
      formattedAddress = 'https://' + address.slice(7)
    } else if (!address.startsWith('https://')) {
      formattedAddress = 'https://' + address
    }
  }

  if (!formattedAddress.endsWith('/api/v3')) {
    formattedAddress += '/api/v3'
  }

  try {
    const response = await fetch(`${formattedAddress}/auth`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        'Content-Type': 'application/json',
      },
    })

    const dataResponse = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: dataResponse.message || 'Authentication failed', status: response.status })
    }

    const { accessToken, refreshToken, scopes } = dataResponse

    const expirationAccessTime = accessToken.expiresIn
    const expirationRefreshTime = refreshToken.expiresIn

    setCookie('add', formattedAddress, expirationRefreshTime)
    setCookie('at', accessToken.token, expirationAccessTime)
    setCookie('rt', refreshToken.token, expirationRefreshTime)
    setCookie('permissions', JSON.stringify(scopes), expirationAccessTime)

    return NextResponse.json(dataResponse)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', status: 500 })
  }
}