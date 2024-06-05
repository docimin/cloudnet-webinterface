'use server'
import { getCookies } from '@/lib/server-calls'

export async function getPermissions(): Promise<string[]> {
  const cookie = await getCookies()
  if (!cookie['permissions']) {
    return []
  }

  return JSON.parse(decodeURIComponent(cookie['permissions']))
}
