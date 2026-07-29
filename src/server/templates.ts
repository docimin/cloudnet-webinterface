import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { cloudnetFetch, query, requirePermissions } from './cloudnet'

const templateParams = z.object({
  storage: z.string(),
  prefix: z.string(),
  name: z.string()
})

const base = (d: z.infer<typeof templateParams>) =>
  `/template/${encodeURIComponent(d.storage)}/${encodeURIComponent(d.prefix)}/${encodeURIComponent(d.name)}`

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

const asNumber = (value: unknown) => (typeof value === 'number' ? value : 0)

const asObjects = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value)
    ? value.flatMap((entry) =>
        entry && typeof entry === 'object'
          ? [entry as Record<string, unknown>]
          : []
      )
    : []

// prefix/name build every template path the browser follows afterwards, so an
// entry missing either is unusable; the spec marks no field required
function withTemplates(raw: unknown): TemplatesList {
  return {
    templates: asObjects(asRecord(raw).templates).flatMap((entry) => {
      const prefix = entry.prefix
      const name = entry.name
      if (typeof prefix !== 'string' || !prefix) return []
      if (typeof name !== 'string' || !name) return []
      return [
        {
          prefix,
          name,
          storage: typeof entry.storage === 'string' ? entry.storage : '',
          priority: asNumber(entry.priority),
          alwaysCopyToStaticServices: entry.alwaysCopyToStaticServices === true
        }
      ]
    })
  }
}

// `path` addresses every later read/write and keys the file table
function withFiles(raw: unknown): FileType[] {
  return asObjects(asRecord(raw).files).flatMap((entry) => {
    const path = entry.path
    if (typeof path !== 'string' || !path) return []
    const name =
      typeof entry.name === 'string' && entry.name
        ? entry.name
        : (path.split('/').pop() ?? path)
    return [
      {
        path,
        name,
        directory: entry.directory === true,
        hidden: entry.hidden === true,
        creationTime: asNumber(entry.creationTime),
        lastModified: asNumber(entry.lastModified),
        lastAccess: asNumber(entry.lastAccess),
        size: asNumber(entry.size)
      }
    ]
  })
}

export const storageList = createServerFn({ method: 'GET' }).handler(
  async () => {
    requirePermissions([
      'cloudnet_rest:template_storage_read',
      'cloudnet_rest:template_storage_list',
      'global:admin'
    ])
    const payload = await cloudnetFetch<unknown>('/templateStorage')
    const storages = asRecord(payload).storages
    return {
      storages: (Array.isArray(storages) ? storages : []).filter(
        (storage): storage is string =>
          typeof storage === 'string' && storage.length > 0
      )
    } satisfies Storages
  }
)

export const storageTemplateList = createServerFn({ method: 'GET' })
  .validator(z.object({ storage: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:template_storage_read',
      'cloudnet_rest:template_storage_template_list',
      'global:admin'
    ])
    return withTemplates(
      await cloudnetFetch<unknown>(
        `/templateStorage/${encodeURIComponent(data.storage)}/templates`
      )
    )
  })

export const templateDirectoryList = createServerFn({ method: 'GET' })
  .validator(
    templateParams.extend({
      directory: z.string().default(''),
      deep: z.boolean().default(false)
    })
  )
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:template_read',
      'cloudnet_rest:template_directory_list',
      'global:admin'
    ])
    return withFiles(
      await cloudnetFetch<unknown>(
        `${base(data)}/directory/list${query({
          directory: data.directory,
          deep: data.deep
        })}`
      )
    )
  })

export const templateFileRead = createServerFn({ method: 'GET' })
  .validator(templateParams.extend({ path: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:template_read',
      'cloudnet_rest:template_file_download',
      'global:admin'
    ])
    return cloudnetFetch<string>(
      `${base(data)}/file/download${query({ path: data.path })}`,
      'GET',
      undefined,
      { response: 'text' }
    )
  })

export const templateFileWrite = createServerFn({ method: 'POST' })
  .validator(
    templateParams.extend({
      path: z.string(),
      content: z.string(),
      encoding: z.enum(['utf8', 'base64']).optional()
    })
  )
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:template_write',
      'cloudnet_rest:template_file_create',
      'global:admin'
    ])
    // base64 lets rename move binary files byte-for-byte
    const body =
      data.encoding === 'base64'
        ? Buffer.from(data.content, 'base64')
        : data.content
    return cloudnetFetch<void>(
      `${base(data)}/file/create${query({ path: data.path })}`,
      'POST',
      body,
      {
        rawBody: true,
        contentType:
          data.encoding === 'base64'
            ? 'application/octet-stream'
            : 'text/plain; charset=utf-8'
      }
    )
  })

export const templateFileDownload = createServerFn({ method: 'POST' })
  .validator(templateParams.extend({ path: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:template_read',
      'cloudnet_rest:template_file_download',
      'global:admin'
    ])
    const buffer = await cloudnetFetch<ArrayBuffer>(
      `${base(data)}/file/download${query({ path: data.path })}`,
      'GET',
      undefined,
      { response: 'binary' }
    )
    return Buffer.from(buffer).toString('base64')
  })

export const templateFileDelete = createServerFn({ method: 'POST' })
  .validator(templateParams.extend({ path: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:template_write',
      'cloudnet_rest:template_delete_file',
      'global:admin'
    ])
    return cloudnetFetch<void>(
      `${base(data)}/file${query({ path: data.path })}`,
      'DELETE'
    )
  })

export const templateDirectoryCreate = createServerFn({ method: 'POST' })
  .validator(templateParams.extend({ path: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:template_write',
      'cloudnet_rest:template_directory_create',
      'global:admin'
    ])
    return cloudnetFetch<void>(
      `${base(data)}/directory/create${query({ path: data.path })}`,
      'POST'
    )
  })

export const templateCreate = createServerFn({ method: 'POST' })
  .validator(templateParams)
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:template_write',
      'cloudnet_rest:template_create',
      'global:admin'
    ])
    return cloudnetFetch<void>(`${base(data)}/create`, 'POST')
  })

export const templateDelete = createServerFn({ method: 'POST' })
  .validator(templateParams)
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:template_write',
      'cloudnet_rest:template_delete',
      'global:admin'
    ])
    return cloudnetFetch<void>(base(data), 'DELETE')
  })

export const templateDownload = createServerFn({ method: 'POST' })
  .validator(templateParams)
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:template_read',
      'cloudnet_rest:template_download',
      'global:admin'
    ])
    // server-function results are JSON-serialised, so the zip travels as base64
    const buffer = await cloudnetFetch<ArrayBuffer>(
      `${base(data)}/download`,
      'GET',
      undefined,
      { response: 'binary' }
    )
    return Buffer.from(buffer).toString('base64')
  })

export const templateDeploy = createServerFn({ method: 'POST' })
  .validator(templateParams.extend({ zip: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:template_write',
      'cloudnet_rest:template_deploy',
      'global:admin'
    ])
    return cloudnetFetch<void>(
      `${base(data)}/deploy`,
      'POST',
      Buffer.from(data.zip, 'base64'),
      { rawBody: true, contentType: 'application/zip' }
    )
  })
