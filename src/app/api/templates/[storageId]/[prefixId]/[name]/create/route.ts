import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute
} from '@/lib/api-helpers'
import { safeTemplateTriple } from '@/lib/pathSafe'

export const POST = createApiRoute(async (_req, { params }) => {
  const p = await params
  let storageId: string, prefixId: string, name: string
  try {
    ;({ storageId, prefixId, name } = safeTemplateTriple(p.storageId, p.prefixId, p.name))
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }

  const requiredPermissions = [
    'cloudnet_rest:template_write',
    'cloudnet_rest:template_create',
    'global:admin'
  ]

  const permissionCheck = await checkPermissions(requiredPermissions)
  if (permissionCheck) {
    return NextResponse.json(permissionCheck, {
      status: permissionCheck.status
    })
  }

  const response = await makeApiRequest(
    `/template/${storageId}/${prefixId}/${name}/create`,
    'POST'
  )
  return NextResponse.json(response)
})
