import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { checkPermissions, createApiRoute } from '@/lib/api-helpers'
import { isEnabled, resolveServiceDir, safeJoin } from '@/lib/serviceFs'

const MAX_INLINE_BYTES = 5 * 1024 * 1024 // 5 MB; anything bigger goes through /download

export const GET = createApiRoute(async (req, { params }) => {
  if (!isEnabled()) return NextResponse.json({ error: 'disabled' }, { status: 501 })

  const permissionCheck = await checkPermissions([
    'cloudnet_rest:service_read',
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
    const st = await fs.stat(target)
    if (st.isDirectory()) return NextResponse.json({ error: 'is a directory' }, { status: 400 })
    if (st.size > MAX_INLINE_BYTES) {
      return NextResponse.json({ error: 'file too big for inline read; use /download' }, { status: 413 })
    }
    const buf = await fs.readFile(target)
    // Return text for the editor; the client decides if it's displayable.
    return new NextResponse(buf.toString('utf8'), {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
})
