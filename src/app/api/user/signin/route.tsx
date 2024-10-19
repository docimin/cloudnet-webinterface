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

  console.log('starting')

  const domainUrl = new URL(
    process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost'
  )
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
        'Content-Type': 'application/json',
      },
    })

    console.log('response', response.toString())
    console.log('address:', address)
    console.log('full address:', `${address}/auth`)
    console.log('respone status', response.status)
    console.log('response text', response.statusText)

    const dataResponse = await response.json()
    console.log('dataResponse', dataResponse)

    if (dataResponse.status) {
      return NextResponse.json(dataResponse)
    } else if (dataResponse.name === 'SyntaxError') {
      return NextResponse.json({ error: 'Invalid response', status: 404 })
    }

    const expirationAccessTime = Number(
      new Date(Date.now() + dataResponse.accessToken.expiresIn)
    )
    const expirationRefreshTime = Number(
      new Date(Date.now() + dataResponse.refreshToken.expiresIn)
    )

    console.log('setting cookies')

    setCookie('add', address, dataResponse.refreshToken.expiresIn)
    setCookie('at', dataResponse.accessToken.token, expirationAccessTime)
    setCookie('rt', dataResponse.refreshToken.token, expirationRefreshTime)
    setCookie(
      'permissions',
      JSON.stringify(dataResponse.scopes),
      expirationAccessTime
    )

    console.log('cookies set')

    return NextResponse.json(dataResponse)
  } catch (error) {
    return NextResponse.json(error)
  }
}
