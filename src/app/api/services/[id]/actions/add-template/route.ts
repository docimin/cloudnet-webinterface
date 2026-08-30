import { NextResponse } from 'next/server'
import { checkPermissions, makeApiRequest, createApiRoute } from '@/lib/api-helpers'
import { safeSegment } from '@/lib/pathSafe'

// Body: { storage?: string, prefix: string, name: string, flush?: boolean }
// Attaches a template to a running service. The template is applied to the
// next start unless flush=true, in which case CloudNet also copies it into
// the current runtime immediately.
export const POST = createApiRoute(async (req, { params }) => {
  const permissionCheck = await checkPermissions([
    'cloudnet_rest:service_write',
    'cloudnet_rest:service_add_template',
    'global:admin'
  ])
  if (permissionCheck) return NextResponse.json(permissionCheck, { status: permissionCheck.status })

  const { id } = await params
  const body = await req.json()
  let storage: string, prefix: string, name: string
  try {
    storage = safeSegment(body.storage || 'local')
    prefix = safeSegment(body.prefix)
    name = safeSegment(body.name)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
  const flush = body.flush === true

  const res = await makeApiRequest(
    `/service/${id}/add/template?flush=${flush}`,
    'POST',
    { prefix, name, storage, priority: 0, alwaysCopyToStaticServices: false },
    { stringifyBody: true, returnJson: false }
  )
  if (res.status === 204) return new NextResponse(null, { status: 204 })
  return NextResponse.json(res, { status: res.status })
})
