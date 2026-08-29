import { NextResponse } from 'next/server'
import { checkPermissions, createApiRoute } from '@/lib/api-helpers'
import { getCookies } from '@/lib/server-calls'

export const GET = createApiRoute(async (_req, { params }) => {
  const { storageId, prefixId, name } = await params

  const requiredPermissions = [
    'cloudnet_rest:template_read',
    'cloudnet_rest:template_download',
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
    `${decodeURIComponent(address)}/template/${storageId}/${prefixId}/${name}/download`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  )

  if (!upstream.ok) {
    const text = await upstream.text()
    return new NextResponse(text || null, { status: upstream.status })
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${prefixId}-${name}.zip"`
    }
  })
})
