import { NextResponse } from 'next/server'
import { checkPermissions, createApiRoute } from '@/lib/api-helpers'
import { getCookies } from '@/lib/server-calls'
import { safeTemplatePath, safeTemplateTriple, contentDispositionAttachment } from '@/lib/pathSafe'

export const GET = createApiRoute(async (req, { params }) => {
  const p = await params
  let storageId: string, prefixId: string, name: string, path: string
  try {
    ;({ storageId, prefixId, name } = safeTemplateTriple(p.storageId, p.prefixId, p.name))
    const { searchParams } = new URL(req.url)
    path = safeTemplatePath(searchParams.get('path'))
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
  if (!path) {
    return NextResponse.json({ error: 'path required' }, { status: 400 })
  }

  const requiredPermissions = [
    'cloudnet_rest:template_read',
    'cloudnet_rest:template_file_get',
    'global:admin'
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status
    })
  }

  const cookies = await getCookies()
  const accessToken = cookies['at']
  const address = cookies['add']

  if (!accessToken || !address) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const upstream = await fetch(
    `${decodeURIComponent(address)}/template/${storageId}/${prefixId}/${name}/file/download?path=${encodeURIComponent(path)}`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  )

  if (!upstream.ok) {
    const text = await upstream.text()
    return new NextResponse(text || null, { status: upstream.status })
  }

  const filename = path.split('/').pop() || 'file'
  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream',
      'Content-Disposition': contentDispositionAttachment(filename)
    }
  })
})
