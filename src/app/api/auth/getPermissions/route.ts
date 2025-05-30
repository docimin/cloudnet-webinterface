import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * This route is used to get the permissions cookie.
 * Only used for the client side, for Server components use `getPermissions.ts`
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

  // Get permission cookie
  const permissions = cookieObject['permissions']

  return NextResponse.json({
    data: JSON.parse(decodeURIComponent(permissions))
  })
}
