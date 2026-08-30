import { NextResponse } from 'next/server'
import { promises as fs, createReadStream } from 'fs'
import { checkPermissions, createApiRoute } from '@/lib/api-helpers'
import { isEnabled, resolveServiceDir, safeJoin } from '@/lib/serviceFs'
import { contentDispositionAttachment } from '@/lib/pathSafe'

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

    const nodeStream = createReadStream(target)
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on('data', (chunk) => controller.enqueue(chunk))
        nodeStream.on('end', () => controller.close())
        nodeStream.on('error', (err) => controller.error(err))
      },
      cancel() { nodeStream.destroy() }
    })

    const filename = sub.split('/').pop() || 'file'
    return new NextResponse(webStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': String(st.size),
        'Content-Disposition': contentDispositionAttachment(filename)
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
})
