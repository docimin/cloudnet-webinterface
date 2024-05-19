import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSessionClient } from '../../../appwrite-session'

export const runtime = 'edge'

export async function POST(request) {
  const { account } = await createSessionClient(request)

  try {
    // Delete the specified cookie
    cookies().set(
      `a_session_${process.env.NEXT_PUBLIC_APPWRITE_DATABASES_PROJECT_ID}`,
      '',
      {
        path: '/',
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
        secure: true,
        httpOnly: true,
        expires: new Date(0),
      }
    )

    await account.deleteSession('current')

    return NextResponse.json({ status: 204 })
  } catch (error) {
    return NextResponse.json({ error: error.message, status: error.code })
  }
}
