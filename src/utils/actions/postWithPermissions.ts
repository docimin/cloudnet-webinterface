'use server'
import { getCookies } from '@/lib/server-calls'
import { getPermissions } from '@/utils/server-api/user/getPermissions'

export async function postWithPermissions(
  url: string,
  requiredPermissions: string[],
  body: any = {},
  returnJson: boolean = true,
  stringifyBody: boolean = true
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
      body: stringifyBody ? JSON.stringify({ ...body }) : body,
    })

    //console.log(response.status + ' ' + response.statusText)

    if (returnJson) {
      return await response.json()
    } else {
      return response
    }
  } catch (error) {
    if (returnJson) {
      return JSON.stringify(error)
    }
    return error
  }
}
