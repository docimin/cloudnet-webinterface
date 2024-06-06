'use server'
import { getCookies } from '@/lib/server-calls'
import { getPermissions } from '@/utils/server-api/user/getPermissions'

export async function fetchWithPermissions(
  url: string,
  requiredPermissions: string[]
) {
  const cookies = await getCookies()
  const perms: string[] = await getPermissions()

  if (!requiredPermissions.some((permission) => perms.includes(permission))) {
    return { status: 401 }
  }

  if (!cookies['at'] || !cookies['add']) {
    return { status: 401 }
  }

  try {
    const decodedUrl = decodeURIComponent(cookies['add'])

    const response = await fetch(`${decodedUrl}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cookies['at']}`,
      },
      cache: 'no-cache',
    })

    //console.log(response.status + ' ' + response.statusText)

    return await response.json()
  } catch (error) {
    return error
  }
}
