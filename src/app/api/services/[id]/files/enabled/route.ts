import { NextResponse } from 'next/server'
import { createApiRoute } from '@/lib/api-helpers'
import { isEnabled } from '@/lib/serviceFs'

export const GET = createApiRoute(async () => {
  return NextResponse.json({ enabled: isEnabled() })
})
