import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { checkPermissions, createApiRoute } from '@/lib/api-helpers'
import { isEnabled, resolveServiceDir, safeJoin } from '@/lib/serviceFs'

// Text-file update. Body: { path: string, content: string }
export const POST = createApiRoute(async (req, { params }) => {
  if (!isEnabled()) return NextResponse.json({ error: 'disabled' }, { status: 501 })

  const permissionCheck = await checkPermissions([
    'cloudnet_rest:service_write',
    'global:admin'
  ])
  if (permissionCheck) return NextResponse.json(permissionCheck, { status: permissionCheck.status })

  const { id } = await params
  const body = await req.json()
  const sub: string = body.path || ''
  const content: string = typeof body.content === 'string' ? body.content : ''
  if (!sub) return NextResponse.json({ error: 'path required' }, { status: 400 })

  try {
    const base = await resolveServiceDir(id)
    const target = await safeJoin(base, sub)
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, content, 'utf8')
    return new NextResponse(null, { status: 204 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
})
