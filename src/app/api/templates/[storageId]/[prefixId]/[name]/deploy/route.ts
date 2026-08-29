import { NextResponse } from 'next/server'
import { checkPermissions, createApiRoute } from '@/lib/api-helpers'
import { getCookies } from '@/lib/server-calls'

export const POST = createApiRoute(async (req, { params }) => {
  const { storageId, prefixId, name } = await params

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
