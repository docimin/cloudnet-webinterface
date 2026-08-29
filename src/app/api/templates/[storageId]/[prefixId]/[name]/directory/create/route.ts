import { NextResponse } from 'next/server'
import {
  checkPermissions,
  makeApiRequest,
  createApiRoute
} from '@/lib/api-helpers'
import { safeTemplatePath, safeTemplateTriple } from '@/lib/pathSafe'

export const POST = createApiRoute(async (req, { params }) => {
  const p = await params
  let storageId: string, prefixId: string, name: string, path: string
  try {
    ;({ storageId, prefixId, name } = safeTemplateTriple(p.storageId, p.prefixId, p.name))
    const { searchParams } = new URL(req.url)
    path = safeTemplatePath(searchParams.get('path'))
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
    `/template/${storageId}/${prefixId}/${name}/directory/create?path=${encodeURIComponent(path)}`,
    'POST'
  )
  return NextResponse.json(response)
})
