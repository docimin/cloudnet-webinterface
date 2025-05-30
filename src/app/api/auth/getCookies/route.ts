import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * This route is used to get the cookies.
 */
export async function GET() {
  const headersList = await headers()
  const cookieHeader = headersList.get('cookie')

  if (!cookieHeader || cookieHeader.trim() === '') {
    return NextResponse.json({})
  }

  const cookieObject = cookieHeader.split('; ').reduce((res, item) => {
    const data = item.split('=')
    return { ...res, [data[0]]: data[1] }
  }, {})

  return NextResponse.json(cookieObject)
}
