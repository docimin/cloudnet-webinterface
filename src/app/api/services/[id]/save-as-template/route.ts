import { NextResponse } from 'next/server'
import { checkPermissions, makeApiRequest, createApiRoute } from '@/lib/api-helpers'
import { safeSegment } from '@/lib/pathSafe'

// Body: { prefix: string, name: string, storage?: string }
// Snapshots the current runtime files of the service into a new template.
export const POST = createApiRoute(async (req, { params }) => {
  const permissionCheck = await checkPermissions([
    'cloudnet_rest:service_write',
    'cloudnet_rest:service_deploy_resources',
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

  const templateRef = { prefix, name, storage, priority: 0, alwaysCopyToStaticServices: false }

  // Create the template if it doesn't exist yet — POST create is idempotent.
  await makeApiRequest(
    `/template/${storage}/${prefix}/${name}/create`,
    'POST'
  )

  // Attach a one-shot deployment targeting our new template.
  const addRes = await makeApiRequest(
    `/service/${id}/add/deployment?flush=false`,
    'POST',
    {
      template: templateRef,
      excludes: [],
      includes: [],
      properties: {}
    },
    { stringifyBody: true, returnJson: false }
  )
  if (addRes.status >= 400) {
    return NextResponse.json({ step: 'add-deployment', ...addRes }, { status: addRes.status })
  }

  // Flush all pending deployments into their target templates, then discard them
  // (?remove=true) so this one-shot deployment isn't kept in the service config.
  const deployRes = await makeApiRequest(
    `/service/${id}/deployResources?remove=true`,
    'POST',
    undefined,
    { returnJson: false }
  )
  if (deployRes.status >= 400) {
    return NextResponse.json({ step: 'deploy-resources', ...deployRes }, { status: deployRes.status })
  }

  return NextResponse.json({ status: 200, template: templateRef })
})
