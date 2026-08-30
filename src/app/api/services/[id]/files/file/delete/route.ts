import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { checkPermissions, createApiRoute } from '@/lib/api-helpers'
import { isEnabled, resolveServiceDir, safeJoin, isProtectedName } from '@/lib/serviceFs'

export const POST = createApiRoute(async (req, { params }) => {
  if (!isEnabled()) return NextResponse.json({ error: 'disabled' }, { status: 501 })

  const permissionCheck = await checkPermissions([
    'cloudnet_rest:service_write',
    'global:admin'
  ])
  if (permissionCheck) return NextResponse.json(permissionCheck, { status: permissionCheck.status })

  const { id } = await params
  const { searchParams } = new URL(req.url)
  const sub = searchParams.get('path') || ''
  if (!sub) return NextResponse.json({ error: 'path required' }, { status: 400 })

  try {
    const base = await resolveServiceDir(id)
    const target = await safeJoin(base, sub)
    if (target === base) return NextResponse.json({ error: 'refuse to delete root' }, { status: 400 })

    // Protect CloudNet wrapper metadata files at the top level.
    const rel = sub.replace(/^\/+/, '')
    if (!rel.includes('/') && isProtectedName(rel)) {
      return NextResponse.json({ error: 'refuse to delete CloudNet wrapper file' }, { status: 400 })
    }

    await fs.rm(target, { force: true })
    return new NextResponse(null, { status: 204 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
})
