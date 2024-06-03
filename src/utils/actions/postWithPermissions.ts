'use server'
import { getCookies } from '@/lib/server-calls'
import { getPermissions } from '@/utils/server-api/user/getPermissions'

export async function postWithPermissions(
  url: string,
  requiredPermissions: string[],
  body: any = {}
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
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cookies['at']}`,
      },
      body: JSON.stringify({ ...body }),
    })

    return await response.json()
  } catch (error) {
    return error
  }
}
