import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { cloudnetFetch, requirePermissions } from './cloudnet'

const text = (value: unknown) =>
  typeof value === 'string' && value ? value : undefined

// the spec marks no RestUser field required, so a node may omit any of it. `id`
// keys the table and routes the edit page, so an entry without one is unusable
// and gets dropped; the detail route can supply the id it asked for instead
export function toUser(raw: unknown, fallbackId?: string): User | null {
  if (!raw || typeof raw !== 'object') return null
  const user = raw as Record<string, unknown>
  const id = text(user.id) ?? fallbackId
  if (!id) return null

  return {
    id,
    username: text(user.username) ?? '',
    scopes: Array.isArray(user.scopes)
      ? user.scopes.filter(
          (scope): scope is string => typeof scope === 'string'
        )
      : [],
    createdAt: text(user.createdAt),
    createdBy: text(user.createdBy),
    modifiedAt: text(user.modifiedAt),
    modifiedBy: text(user.modifiedBy)
  }
}

export const userList = createServerFn({ method: 'GET' }).handler(async () => {
  requirePermissions([
    'cloudnet_rest:user_read',
    'cloudnet_rest:user_get_all',
    'global:admin'
  ])
  const payload = await cloudnetFetch<unknown>('/user')
  const users = (payload as { users?: unknown } | null)?.users

  return {
    users: (Array.isArray(users) ? users : []).flatMap((entry) => {
      const user = toUser(entry)
      return user ? [user] : []
    })
  }
})

export const userGet = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:user_read',
      'cloudnet_rest:user_get',
      'global:admin'
    ])
    const payload = await cloudnetFetch<unknown>(
      `/user/${encodeURIComponent(data.id)}`
    )
    return toUser(payload, data.id)
  })

export const userCreate = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      username: z.string(),
      password: z.string(),
      scopes: z.array(z.string())
    })
  )
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:user_write',
      'cloudnet_rest:user_create',
      'global:admin'
    ])
    // the 201 echoes the created user, but a node answering with an empty body
    // must not read as a failure — cloudnetFetch already threw if it went wrong
    await cloudnetFetch<unknown>('/user', 'POST', data)
    return { ok: true }
  })

export const userUpdate = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      id: z.string(),
      scopes: z.array(z.string()),
      password: z.string().optional()
    })
  )
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:user_write',
      'cloudnet_rest:user_update',
      'global:admin'
    ])
    // id stays in the body — the old client sent it there as well
    await cloudnetFetch<unknown>(
      `/user/${encodeURIComponent(data.id)}`,
      'PUT',
      data
    )
    return { ok: true }
  })

export const userDelete = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:user_write',
      'cloudnet_rest:user_delete',
      'global:admin'
    ])
    // 204: cloudnetFetch turns the empty body into `true`, or into raw text if
    // the node answered with something non-JSON
    await cloudnetFetch<true | string>(
      `/user/${encodeURIComponent(data.id)}`,
      'DELETE'
    )
    return { ok: true }
  })
