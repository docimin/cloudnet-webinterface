import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { cloudnetFetch, requirePermissions } from './cloudnet'

// the spec marks no field of GroupConfiguration required, so anything without a
// usable name is dropped here: `name` keys the table, addresses the detail route
// and is compared against the edited JSON before an update is sent. Everything
// else is passed through verbatim — the detail page round-trips the document
// back to POST /group, so invented defaults would be written to the node.
function asGroup(raw: unknown): Group | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const group = raw as Group
  return typeof group.name === 'string' && group.name ? group : null
}

// groups carry a free-form `properties` document that Start's output
// serialization check cannot prove
export const groupList = createServerFn({
  method: 'GET',
  strict: { output: false } as const
}).handler(async () => {
  requirePermissions([
    'cloudnet_rest:group_read',
    'cloudnet_rest:group_list',
    'global:admin'
  ])
  const payload = await cloudnetFetch<unknown>('/group')
  const raw = (payload as { groups?: unknown } | null)?.groups
  return {
    groups: (Array.isArray(raw) ? raw : []).flatMap(
      (entry) => asGroup(entry) ?? []
    )
  }
})

export const groupGet = createServerFn({
  method: 'GET',
  strict: { output: false } as const
})
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:group_read',
      'cloudnet_rest:group_get',
      'global:admin'
    ])
    return asGroup(
      await cloudnetFetch<unknown>(`/group/${encodeURIComponent(data.id)}`)
    )
  })

export const groupUpdate = createServerFn({ method: 'POST' })
  .validator(z.record(z.string(), z.unknown()))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:group_write',
      'cloudnet_rest:group_create',
      'global:admin'
    ])
    // 201 with an empty body; reaching here at all means the node accepted it
    await cloudnetFetch<unknown>('/group', 'POST', data)
    return true
  })

export const groupDelete = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:group_write',
      'cloudnet_rest:group_delete',
      'global:admin'
    ])
    await cloudnetFetch<unknown>(
      `/group/${encodeURIComponent(data.id)}`,
      'DELETE'
    )
    return true
  })
