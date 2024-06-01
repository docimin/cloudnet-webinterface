import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  // if POST is not json, return 400
  if (request.headers.get('content-type') !== 'application/json') {
    return NextResponse.json({ error: 'Invalid content type', status: 400 })
  }
  if (!request.body) {
    return NextResponse.json({ error: 'No body provided', status: 400 })
  }

  const setCookie = (name: string, value: string, expiresIn: number) => {
    cookies().set(name, value, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: Number(new Date(Date.now() + expiresIn)),
      path: '/',
    })
  }

  let { address, username, password } = await request.json()

  if (address.startsWith('https://')) {
    address = 'http://' + address.slice(8)
  } else if (!address.startsWith('http://')) {
    address = 'http://' + address
  }
  if (!address.endsWith('/api/v3')) {
    address += '/api/v3'
  }

  try {
    const response = await fetch(`${address}/auth`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        'Content-Type': 'application/json',
      },
    })

    const dataResponse = await response.json()

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

    return NextResponse.json(dataResponse)
  } catch (error) {
    return NextResponse.json(error)
  }
}