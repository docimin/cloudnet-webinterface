import { getCookies } from '@/lib/server-calls'

export async function getPermissions() {
  const cookie = await getCookies()
  if (!cookie['permissions']) {
    return { permissions: [] }
  }

  return decodeURIComponent(cookie['permissions'].split(','))
}
