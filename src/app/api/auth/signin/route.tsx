import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * This route is used to sign in the user and set the cookies.
 */
export async function POST(request: NextRequest) {
  const cookie = await cookies()
  // if POST is not json, return 400
  if (request.headers.get('content-type') !== 'application/json') {
    return NextResponse.json({ error: 'Invalid content type', status: 400 })
  }
  if (!request.body) {
    return NextResponse.json({ error: 'No body provided', status: 400 })
  }

  const domainUrl = new URL(process.env.NEXT_PUBLIC_DOMAIN)
  const isSecure = domainUrl.protocol === 'https:'

  const setCookie = async (
    name: string,
    value: string,
    expiresIn: number,
    httpOnly: boolean = true
  ) => {
    cookie.set(name, value, {
      httpOnly: httpOnly,
      secure: isSecure,
      sameSite: 'strict',
      maxAge: expiresIn,
      path: '/'
    })
  }

  let { address, username, password } = await request.json()

  const ipPattern = new RegExp(
    /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]{1,5})?$/
  )

  if (ipPattern.test(address)) {
    if (!address.startsWith('http://')) {
      address = 'http://' + address
    }
  } else {
    if (address.startsWith('http://')) {
      address = 'https://' + address.slice(7)
    } else if (!address.startsWith('https://')) {
      address = 'https://' + address
    }
  }

  if (!address.endsWith('/api/v3')) {
    address += '/api/v3'
  }

  try {
    const response = await fetch(`${address}/auth`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        'Content-Type': 'application/json'
      }
    })

    const dataResponse = await response.json()

    if (dataResponse.name === 'SyntaxError') {
      return NextResponse.json({ error: 'Invalid response', status: 404 })
    }

    const expirationAccessTime = Number(
      new Date(Date.now() + dataResponse.accessToken.expiresIn)
    )
    const expirationRefreshTime = Number(
      new Date(Date.now() + dataResponse.refreshToken.expiresIn)
    )

    await setCookie('add', address, dataResponse.refreshToken.expiresIn)
    await setCookie('at', dataResponse.accessToken.token, expirationAccessTime)
    await setCookie(
      'rt',
      dataResponse.refreshToken.token,
      expirationRefreshTime
    )
    await setCookie(
      'permissions',
      JSON.stringify(dataResponse.scopes),
      expirationAccessTime
    )

    return NextResponse.json(dataResponse)
  } catch (error) {
    if (error.message === 'fetch failed') {
      return NextResponse.json(
        { error: 'Incorrect address!', status: 404 },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
