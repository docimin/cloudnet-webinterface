'use server'
import { getCookies } from '@/lib/server-calls'
import { unstable_noStore } from 'next/cache'

export async function getPermissions(): Promise<string[]> {
  unstable_noStore()
  const cookie = await getCookies()
  if (!cookie['permissions']) {
    return []
  }

  return JSON.parse(decodeURIComponent(cookie['permissions']))
}
