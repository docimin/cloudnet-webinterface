import { createSessionServerClient } from '../../../appwrite-session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request) {
  const { teams } = await createSessionServerClient()
  // if POST is not json, return 400
  if (request.headers.get('content-type') !== 'application/json') {
    return NextResponse.json({ error: 'Invalid content type', status: 400 })
  }

  try {
    const teamsData = await teams.list()

    cookies().set(`orgId`, teamsData.teams[0].$id, {
      httpOnly: false,
      secure: true,
      sameSite: 'Lax',
      //maxAge: new Date(session.expire),
      path: '/',
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    })

    return NextResponse.json(teamsData)
  } catch (error) {
    return NextResponse.json(error)
  }
}
