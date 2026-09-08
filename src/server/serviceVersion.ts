import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import type {
  ServiceEnvironmentType,
  ServiceVersion,
  ServiceVersionType
} from '@/utils/types/serviceVersions'
import { cloudnetFetch, query, requirePermissions } from './cloudnet'

// the spec marks no field required and a node may answer a registry map keyed by
// name where an array is documented, so every list is coerced back to an array of
// objects and anything without a usable name is dropped: `name` keys React lists
// and feeds Radix `SelectItem`, which throws on an empty value
function withNames<T extends { name: string }>(raw: unknown): T[] {
  const entries: Record<string, unknown>[] = Array.isArray(raw)
    ? raw.flatMap((entry) =>
        typeof entry === 'string'
          ? [{ name: entry }]
          : entry && typeof entry === 'object'
            ? [entry as Record<string, unknown>]
            : []
      )
    : raw && typeof raw === 'object'
      ? Object.entries(raw).map(([key, value]) => {
          const entry =
            value && typeof value === 'object'
              ? { ...(value as Record<string, unknown>) }
              : {}
          if (typeof entry.name !== 'string' || !entry.name) entry.name = key
          return entry
        })
      : []

  return entries.filter(
    (entry): entry is T & Record<string, unknown> =>
      typeof entry.name === 'string' && entry.name.length > 0
  ) as T[]
}

function withVersions(type: ServiceVersionType): ServiceVersionType {
  return { ...type, versions: withNames<ServiceVersion>(type.versions) }
}

// versions and environments carry a free-form `properties` document, which the
// output serializability check cannot prove
export const serviceVersionList = createServerFn({
  method: 'GET',
  strict: { output: false }
}).handler(async () => {
  requirePermissions([
    'cloudnet_rest:service_version_read',
    'cloudnet_rest:service_version_list',
    'global:admin'
  ])
  const payload = await cloudnetFetch<unknown>('/serviceVersion')
  return {
    serviceVersionTypes: withNames<ServiceVersionType>(
      (payload as { serviceVersionTypes?: unknown } | null)?.serviceVersionTypes
    ).map(withVersions)
  }
})

export const serviceVersionGet = createServerFn({
  method: 'GET',
  strict: { output: false }
})
  .validator(z.object({ version: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:service_version_read',
      'cloudnet_rest:service_version_get',
      'global:admin'
    ])
    const payload = await cloudnetFetch<unknown>(
      `/serviceVersion/${encodeURIComponent(data.version)}`
    )
    if (!payload || typeof payload !== 'object') return null
    const type = payload as ServiceVersionType
    return withVersions({ ...type, name: type.name || data.version })
  })

export const serviceEnvironmentList = createServerFn({
  method: 'GET',
  strict: { output: false }
}).handler(async () => {
  requirePermissions([
    'cloudnet_rest:service_version_read',
    'cloudnet_rest:service_version_list_environments',
    'global:admin'
  ])
  const payload = await cloudnetFetch<unknown>('/serviceVersion/environment')
  return {
    environments: withNames<ServiceEnvironmentType>(
      (payload as { environments?: unknown } | null)?.environments
    )
  }
})

export const serviceVersionLoad = createServerFn({ method: 'POST' })
  .validator(z.object({ url: z.string().optional() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:service_version_write',
      'cloudnet_rest:service_version_load',
      'global:admin'
    ])
    // no url falls back to the versions bundled with the node installation
    // 204: cloudnetFetch turns the empty body into `true`, or into raw text if
    // the node answered with something non-JSON
    await cloudnetFetch<true | string>(
      `/serviceVersion/load${query({ url: data.url || undefined })}`,
      'POST'
    )
    return { ok: true }
  })

export const serviceVersionInstall = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      template: z.object({
        storage: z.string(),
        prefix: z.string(),
        name: z.string(),
        priority: z.number(),
        alwaysCopyToStaticServices: z.boolean()
      }),
      serviceVersionType: z.string(),
      serviceVersion: z.string(),
      force: z.boolean().optional(),
      cache: z.boolean().optional()
    })
  )
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:service_version_write',
      'cloudnet_rest:service_version_install',
      'global:admin'
    ])
    // 204: same empty-body handling as /serviceVersion/load above
    await cloudnetFetch<true | string>(
      `/serviceVersion/install${query({
        force: data.force,
        cache: data.cache
      })}`,
      'POST',
      {
        template: data.template,
        serviceVersionType: data.serviceVersionType,
        serviceVersion: data.serviceVersion
      }
    )
    return { ok: true }
  })
