import { NextResponse } from 'next/server'
import { checkPermissions, createApiRoute } from '@/lib/api-helpers'
import { getCookies } from '@/lib/server-calls'
import { safeTemplateTriple } from '@/lib/pathSafe'

export const POST = createApiRoute(async (req, { params }) => {
  const p = await params
  let storageId: string, prefixId: string, name: string
  try {
    ;({ storageId, prefixId, name } = safeTemplateTriple(p.storageId, p.prefixId, p.name))
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }

  const requiredPermissions = [
    'cloudnet_rest:template_write',
    'cloudnet_rest:template_deploy',
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

  const bodyBuffer = await req.arrayBuffer()

  const upstream = await fetch(
    `${decodeURIComponent(address)}/template/${storageId}/${prefixId}/${name}/deploy`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/zip',
        Authorization: `Bearer ${accessToken}`
      },
      body: bodyBuffer
    }
  )

  const text = await upstream.text()
  return new NextResponse(text || null, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json' }
  })
})

export const config = {
  api: { bodyParser: false }
}
