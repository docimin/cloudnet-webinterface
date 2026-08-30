import { NextResponse } from 'next/server'
import { checkPermissions, createApiRoute } from '@/lib/api-helpers'
import { isEnabled, resolveServiceDir, safeJoin, listDir } from '@/lib/serviceFs'

export const GET = createApiRoute(async (req, { params }) => {
  if (!isEnabled()) {
    return NextResponse.json({ error: 'service files browser disabled' }, { status: 501 })
  }

  const permissionCheck = await checkPermissions([
    'cloudnet_rest:service_read',
    'cloudnet_rest:service_get',
    'global:admin'
  ])
  if (permissionCheck) return NextResponse.json(permissionCheck, { status: permissionCheck.status })

  const { id } = await params
  const { searchParams } = new URL(req.url)
  const sub = searchParams.get('directory') || ''

  try {
    const base = await resolveServiceDir(id)
    const dir = await safeJoin(base, sub)
    const entries = await listDir(dir, base)
    return NextResponse.json({ files: entries })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
})
