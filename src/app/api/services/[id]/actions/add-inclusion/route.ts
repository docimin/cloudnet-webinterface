import { NextResponse } from 'next/server'
import { checkPermissions, makeApiRequest, createApiRoute } from '@/lib/api-helpers'

// Body: { url: string, destination: string, flush?: boolean }
// Adds a remote inclusion (URL → path inside the service) to be downloaded
// on the next start, or immediately if flush=true.
export const POST = createApiRoute(async (req, { params }) => {
  const permissionCheck = await checkPermissions([
    'cloudnet_rest:service_write',
    'cloudnet_rest:service_add_inclusion',
    'global:admin'
  ])
  if (permissionCheck) return NextResponse.json(permissionCheck, { status: permissionCheck.status })

  const { id } = await params
  const body = await req.json()
  const url: string = (body.url || '').trim()
  const destination: string = (body.destination || '').trim()
  const flush = body.flush === true

  if (!/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: 'url must be http(s)://' }, { status: 400 })
  }
  if (!destination || destination.startsWith('/') || destination.includes('..') || destination.includes('\\')) {
    return NextResponse.json({ error: 'destination must be a relative path without ..' }, { status: 400 })
  }

  const res = await makeApiRequest(
    `/service/${id}/add/inclusion?flush=${flush}`,
    'POST',
    { url, destination, properties: {} },
    { stringifyBody: true, returnJson: false }
  )
  if (res.status === 204) return new NextResponse(null, { status: 204 })
  return NextResponse.json(res, { status: res.status })
})
