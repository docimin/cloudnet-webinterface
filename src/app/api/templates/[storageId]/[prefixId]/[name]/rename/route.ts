import { NextResponse } from 'next/server'
import { checkPermissions, createApiRoute } from '@/lib/api-helpers'
import { getCookies } from '@/lib/server-calls'

// Emulates rename by download → upload with new path → delete old.
// Body: { from: string, to: string, isDirectory?: boolean }
export const POST = createApiRoute(async (req, { params }) => {
  const { storageId, prefixId, name } = await params

  const requiredPermissions = [
    'cloudnet_rest:template_write',
    'cloudnet_rest:template_file_append',
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

  const { from, to, isDirectory } = await req.json()

  if (!from || !to || from === to) {
    return NextResponse.json({ error: 'Invalid from/to' }, { status: 400 })
  }

  const base = `${decodeURIComponent(address)}/template/${storageId}/${prefixId}/${name}`
  const authHeader = { Authorization: `Bearer ${accessToken}` }

  const listFiles = async (path: string): Promise<Array<{ path: string; directory: boolean }>> => {
    const res = await fetch(
      `${base}/directory/list?deep=true&directory=${encodeURIComponent(path)}`,
      { headers: authHeader }
    )
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  }

  const copyFile = async (srcPath: string, dstPath: string) => {
    const dl = await fetch(
      `${base}/file/download?path=${encodeURIComponent(srcPath)}`,
      { headers: authHeader }
    )
    if (!dl.ok) throw new Error(`download failed: ${dl.status}`)
    const buf = await dl.arrayBuffer()
    const up = await fetch(
      `${base}/file/create?path=${encodeURIComponent(dstPath)}`,
      {
        method: 'POST',
        headers: {
          ...authHeader,
          'Content-Type': 'application/octet-stream'
        },
        body: buf
      }
    )
    if (!up.ok) throw new Error(`upload failed: ${up.status}`)
  }

  const mkdir = async (path: string) => {
    await fetch(
      `${base}/directory/create?path=${encodeURIComponent(path)}`,
      { method: 'POST', headers: authHeader }
    )
  }

  const deleteFile = async (path: string) => {
    await fetch(
      `${base}/file?path=${encodeURIComponent(path)}`,
      { method: 'DELETE', headers: authHeader }
    )
  }

  try {
    if (isDirectory) {
      const items = await listFiles(from)
      await mkdir(to)
      for (const item of items) {
        const relative = item.path.startsWith(from + '/')
          ? item.path.slice(from.length + 1)
          : item.path
        const dstPath = `${to}/${relative}`
        if (item.directory) {
          await mkdir(dstPath)
        } else {
          await copyFile(item.path, dstPath)
        }
      }
      for (const item of items.slice().reverse()) {
        await deleteFile(item.path)
      }
      await deleteFile(from)
    } else {
      await copyFile(from, to)
      await deleteFile(from)
    }
    return NextResponse.json({ status: 204 }, { status: 204 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'rename failed' }, { status: 500 })
  }
})
