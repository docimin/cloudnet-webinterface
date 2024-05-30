import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request) {
  // if POST is not json, return 400
  if (request.headers.get('content-type') !== 'application/json') {
    return NextResponse.json({ error: 'Invalid content type', status: 400 })
  }
  if (!request.body) {
    return NextResponse.json({ error: 'No body provided', status: 400 })
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

    const expirationAccessTime = new Date(
      Date.now() + dataResponse.accessToken.expiresIn
    )
    const expirationRefreshTime = new Date(
      Date.now() + dataResponse.refreshToken.expiresIn
    )

    cookies().set(`add`, address, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: expirationRefreshTime,
      path: '/',
    })

    cookies().set(`at`, dataResponse.accessToken.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: expirationAccessTime,
      path: '/',
    })

    cookies().set(`rt`, dataResponse.refreshToken.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: expirationRefreshTime,
      path: '/',
    })

    return NextResponse.json(dataResponse)
  } catch (error) {
    return NextResponse.json(error)
  }
}
