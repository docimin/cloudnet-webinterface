import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { isSafeSegment, isSafeTemplatePath } from '@/lib/templatePath'
import { cloudnetFetch, query, requirePermissions } from './cloudnet'

// CloudNet resolves these straight against the template directory, so the
// traversal check belongs on the schema rather than on each call site
const templateSegment = z.string().refine(isSafeSegment, 'unsafe segment')
const templatePath = z.string().refine(isSafeTemplatePath, 'unsafe path')

const templateParams = z.object({
  storage: templateSegment,
  prefix: templateSegment,
  name: templateSegment
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
      directory: templatePath.default(''),
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
  .validator(templateParams.extend({ path: templatePath }))
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
      path: templatePath,
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
    // base64 lets uploads carry binary files byte-for-byte
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
  .validator(templateParams.extend({ path: templatePath }))
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
  .validator(templateParams.extend({ path: templatePath }))
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
  .validator(templateParams.extend({ path: templatePath }))
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

type TemplateParams = z.infer<typeof templateParams>

const listDirectory = (p: TemplateParams, directory: string, deep: boolean) =>
  cloudnetFetch<unknown>(
    `${base(p)}/directory/list${query({ directory, deep })}`
  )

const makeDirectory = (p: TemplateParams, path: string) =>
  cloudnetFetch<void>(`${base(p)}/directory/create${query({ path })}`, 'POST')

const removeEntry = (p: TemplateParams, path: string) =>
  cloudnetFetch<void>(`${base(p)}/file${query({ path })}`, 'DELETE')

// octet-stream both ways so a jar survives the copy byte-for-byte
const copyFile = async (p: TemplateParams, from: string, to: string) => {
  const buffer = await cloudnetFetch<ArrayBuffer>(
    `${base(p)}/file/download${query({ path: from })}`,
    'GET',
    undefined,
    { response: 'binary' }
  )
  await cloudnetFetch<void>(
    `${base(p)}/file/create${query({ path: to })}`,
    'POST',
    Buffer.from(buffer),
    { rawBody: true, contentType: 'application/octet-stream' }
  )
}

const depth = (path: string) => path.split('/').length

const parentOf = (path: string) => path.split('/').slice(0, -1).join('/')

// `failed` names the entry that stopped the copy, and nothing was removed then;
// `notRemoved` lists sources that survived an otherwise complete rename
type RenameResult = { failed: string | null; notRemoved: string[] }

// CloudNet has no move endpoint, so a rename is copy-then-delete. Directories
// take one request per entry, which is why this runs here rather than in the
// browser, and the source is only touched once every copy has landed.
export const templateRename = createServerFn({ method: 'POST' })
  .validator(
    templateParams
      .extend({
        from: z.string().min(1).refine(isSafeTemplatePath, 'unsafe path'),
        to: z.string().min(1).refine(isSafeTemplatePath, 'unsafe path')
      })
      .refine(
        (d) => d.from !== d.to && !d.to.startsWith(`${d.from}/`),
        'a directory cannot be renamed into itself'
      )
  )
  .handler(async ({ data }): Promise<RenameResult> => {
    requirePermissions([
      'cloudnet_rest:template_read',
      'cloudnet_rest:template_directory_list',
      'global:admin'
    ])
    requirePermissions([
      'cloudnet_rest:template_read',
      'cloudnet_rest:template_file_download',
      'global:admin'
    ])
    requirePermissions([
      'cloudnet_rest:template_write',
      'cloudnet_rest:template_file_create',
      'global:admin'
    ])
    requirePermissions([
      'cloudnet_rest:template_write',
      'cloudnet_rest:template_delete_file',
      'global:admin'
    ])

    const { from, to } = data

    // a caller that mislabels a directory as a file would delete it unread, so
    // ask the listing rather than trusting a flag from the browser
    const source = withFiles(
      await listDirectory(data, parentOf(from), false)
    ).find((entry) => entry.path === from)
    if (!source) return { failed: from, notRemoved: [] }

    // only a folder rename creates directories, so gate that scope separately
    if (source.directory) {
      requirePermissions([
        'cloudnet_rest:template_write',
        'cloudnet_rest:template_directory_create',
        'global:admin'
      ])
    }

    const entries = source.directory
      ? withFiles(await listDirectory(data, from, true))
      : []

    const escaped = entries.find((entry) => !entry.path.startsWith(`${from}/`))
    if (escaped) return { failed: escaped.path, notRemoved: [] }

    const target = (path: string) => `${to}${path.slice(from.length)}`

    const copies: { path: string; run: () => Promise<unknown> }[] =
      source.directory
        ? [
            { path: to, run: () => makeDirectory(data, to) },
            ...entries
              .filter((entry) => entry.directory)
              .sort((a, b) => depth(a.path) - depth(b.path))
              .map((entry) => ({
                path: entry.path,
                run: () => makeDirectory(data, target(entry.path))
              })),
            ...entries
              .filter((entry) => !entry.directory)
              .map((entry) => ({
                path: entry.path,
                run: () => copyFile(data, entry.path, target(entry.path))
              }))
          ]
        : [{ path: from, run: () => copyFile(data, from, to) }]

    for (const copy of copies) {
      try {
        await copy.run()
      } catch {
        return { failed: copy.path, notRemoved: [] }
      }
    }

    const notRemoved: string[] = []
    const removals = [
      ...entries.map((entry) => entry.path).sort((a, b) => depth(b) - depth(a)),
      from
    ]
    for (const path of removals) {
      try {
        await removeEntry(data, path)
      } catch {
        notRemoved.push(path)
      }
    }

    return { failed: null, notRemoved }
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
