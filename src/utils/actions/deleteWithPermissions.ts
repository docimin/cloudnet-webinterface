import { getCookies } from '@/lib/server-calls'
import { getPermissions } from '@/utils/server-api/user/getPermissions'

export async function deleteWithPermissions(
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
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cookies['at']}`,
      },
    })

    //console.log(response.status + ' ' + response.statusText)

    return response.ok
      ? { success: response.statusText, status: response.status }
      : {
          error: 'Failed to delete',
          status: 500,
        }
  } catch (error) {
    return { error: error.statusText, status: error.status }
  }
}
