import { headers } from 'next/headers'

export async function getAnnouncements() {
  const headersList = headers()
  const cookieHeader = headersList.get('cookie')

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/databases/hp_db/collections/announcements/documents`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APPWRITE_DATABASES_PROJECT_ID}`,
        'X-Appwrite-Response-Format': '1.4.0',
        Cookie: cookieHeader,
      },
      next: {
        revalidate: 5,
      },
    }
  )

  try {
    return await response.json()
  } catch (error) {
    console.error('Failed to parse JSON:', error)
    return []
  }
}

export async function getAnnouncement(announcementId) {
  const headersList = headers()
  const cookieHeader = headersList.get('cookie')

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/databases/hp_db/collections/announcements/documents/${announcementId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APPWRITE_DATABASES_PROJECT_ID}`,
        'X-Appwrite-Response-Format': '1.4.0',
        Cookie: cookieHeader,
      },
      cache: 'no-cache',
    }
  ).then((response) => response.json())

  if (response.code === 404) {
    return false
  }

  return response
}
