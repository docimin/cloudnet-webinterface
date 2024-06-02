import { getCookies } from '@/lib/server-calls'
import { getPermissions } from '@/utils/server-api/user/getPermissions'

export async function putWithPermissions(
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
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cookies['at']}`,
      },
      body: JSON.stringify({ ...body }),
    })

    return response.ok
      ? { success: 'Updated successfully', status: 200 }
      : {
          error: 'Failed to update',
          status: 500,
        }
  } catch (error) {
    return { error: 'Failed to update', status: 500 }
  }
}
