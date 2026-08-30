import { NextResponse } from 'next/server'
import { checkPermissions, makeApiRequest, createApiRoute } from '@/lib/api-helpers'

// Body: { taskName: string, start?: boolean }
// Creates a service instance from an existing task, optionally auto-starts it.
export const POST = createApiRoute(async (req) => {
  const permissionCheck = await checkPermissions([
    'cloudnet_rest:service_write',
    'cloudnet_rest:service_create_task_name',
    'global:admin'
  ])
  if (permissionCheck) return NextResponse.json(permissionCheck, { status: permissionCheck.status })

  const body = await req.json()
  const taskName: string = body.taskName
  const autoStart: boolean = body.start !== false
  if (!taskName) return NextResponse.json({ error: 'taskName required' }, { status: 400 })

  const created = await makeApiRequest(
    `/service/create/taskName`,
    'POST',
    { taskName },
    { stringifyBody: true }
  )
  if (created.status >= 400) return NextResponse.json(created, { status: created.status })

  const cd: any = created.data
  const uuid: string | undefined =
    cd?.serviceInfo?.configuration?.serviceId?.uniqueId ||
    cd?.creationId ||
    cd?.serviceInfoSnapshot?.configuration?.serviceId?.uniqueId ||
    cd?.uniqueId
  if (autoStart && uuid) {
    await makeApiRequest(`/service/${uuid}/lifecycle?target=start`, 'PATCH')
  }
  return NextResponse.json({ status: 200, data: created.data, uuid })
})
