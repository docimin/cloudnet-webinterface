import { getCookies } from '@/lib/server-calls'

export async function getNodes() {
  const cookies = await getCookies()

  if (!cookies['at'] || !cookies['add']) {
    return { status: 401 }
  }

  try {
    const decodedUrl = decodeURIComponent(cookies['add'])

    const response = await fetch(`${decodedUrl}/cluster`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cookies['at']}`,
      },
    })

    return await response.json()
  } catch (error) {
    console.log('Error:', error)
    return error
  }
}
