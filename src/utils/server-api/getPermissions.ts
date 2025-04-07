import { getCookies } from '@/lib/server-calls'

export async function getPermissions(): Promise<string[]> {
  const cookies = await getCookies()
  if (!cookies['permissions']) {
    return []
  }

  return JSON.parse(decodeURIComponent(cookies['permissions']))
}
