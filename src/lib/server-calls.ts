'use server'
import { headers } from 'next/headers'

export async function getCookies() {
  const headersList = await headers()
  const cookieHeader = headersList.get('cookie')
  if (!cookieHeader || cookieHeader.trim() === '') return {}
  return cookieHeader.split('; ').reduce((res, item) => {
    const data = item.split('=')
    return { ...res, [data[0]]: data[1] }
  }, {})
}

export async function getCookie(name: string) {
  const cookies = await getCookies()
  return decodeURIComponent(cookies[name])
}

export async function checkAuthToken() {
  const cookies = await getCookies()

  if (!cookies['rt'] || !cookies['add']) {
    return { status: 401 }
  }

  try {
    const decodedUrl = decodeURIComponent(cookies['add'])

    const response = await fetch(`${decodedUrl}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cookies['at']}`,
      },
    })

    return await response.json()
  } catch (error) {
    return error
  }
}
