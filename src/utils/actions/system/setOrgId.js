'use server'
import { createSessionServerClient } from '@/app/appwrite-session'
import { cookies } from 'next/headers'

export async function setOrgId() {
  const { teams } = await createSessionServerClient()
  const teamsData = await teams.list().catch((error) => {
    return error
  })
  
  cookies().set(`orgId`, teamsData.teams[0].$id, {
    httpOnly: false,
    secure: true,
    sameSite: 'Lax',
    //maxAge: new Date(session.expire),
    path: '/',
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
  })

  return teamsData
}
