import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const runtime = 'edge'

export async function POST(request) {
  try {
    // Delete the specified cookie
    cookies().delete('add')
    cookies().delete('at')
    cookies().delete('rt')
    cookies().delete('permissions')

    return NextResponse.json({ status: 204 })
  } catch (error) {
    return NextResponse.json({ error: error.message, status: error.code })
  }
}
