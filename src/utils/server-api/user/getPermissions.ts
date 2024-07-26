'use server'
import { getCookies } from '@/lib/server-calls'
import { unstable_noStore } from 'next/cache'

export async function getPermissions(): Promise<string[]> {
  unstable_noStore()
  const cookies = await getCookies()
  if (!cookies['permissions']) {
    return []
  }

  return JSON.parse(decodeURIComponent(cookies['permissions']))
}
