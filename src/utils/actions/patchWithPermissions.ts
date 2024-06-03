import { getCookies } from '@/lib/server-calls'
import { getPermissions } from '@/utils/server-api/user/getPermissions'

export async function patchWithPermissions(
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
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cookies['at']}`,
      },
      body: JSON.stringify({ ...body }),
    })

    return response.ok
      ? { success: response.statusText, status: response.status }
      : {
          error: response.statusText,
          status: response.status,
        }
  } catch (error) {
    return { error: error.message, status: error.status }
  }
}
