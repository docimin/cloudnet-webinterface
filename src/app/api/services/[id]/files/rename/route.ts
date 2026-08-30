import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { checkPermissions, createApiRoute } from '@/lib/api-helpers'
import { isEnabled, resolveServiceDir, safeJoin } from '@/lib/serviceFs'

// Body: { from: string, to: string }
// Native fs.rename works for files AND directories — no recursive dance
// needed on the local filesystem.
export const POST = createApiRoute(async (req, { params }) => {
  if (!isEnabled()) return NextResponse.json({ error: 'disabled' }, { status: 501 })

  const permissionCheck = await checkPermissions([
    'cloudnet_rest:service_write',
    'global:admin'
  ])
  if (permissionCheck) return NextResponse.json(permissionCheck, { status: permissionCheck.status })

  const { id } = await params
  const body = await req.json()
  const from: string = body.from || ''
  const to: string = body.to || ''
  if (!from || !to || from === to) return NextResponse.json({ error: 'invalid from/to' }, { status: 400 })

  try {
    const base = await resolveServiceDir(id)
    const src = await safeJoin(base, from)
    const dst = await safeJoin(base, to)
    if (src === base || dst === base) {
      return NextResponse.json({ error: 'refuse to rename to/from service root' }, { status: 400 })
    }
    await fs.mkdir(path.dirname(dst), { recursive: true })
    await fs.rename(src, dst)
    return new NextResponse(null, { status: 204 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
})
