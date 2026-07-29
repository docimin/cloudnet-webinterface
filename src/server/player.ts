import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { cloudnetFetch, query, requirePermissions } from './cloudnet'

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

const asString = (value: unknown) => (typeof value === 'string' ? value : '')

const asNumber = (value: unknown) => (typeof value === 'number' ? value : 0)

// the player table and detail page print `task<splitter><id>` off both services
// without a guard, and CloudPlayer declares no required field
function withService(raw: unknown): NetworkService {
  const service = asRecord(raw)
  const serviceId = asRecord(service.serviceId)
  return {
    ...service,
    groups: Array.isArray(service.groups)
      ? service.groups.filter((group) => typeof group === 'string')
      : [],
    serviceId: {
      ...serviceId,
      taskName: asString(serviceId.taskName),
      nameSplitter: asString(serviceId.nameSplitter),
      taskServiceId: asNumber(serviceId.taskServiceId),
      nodeUniqueId: asString(serviceId.nodeUniqueId)
    }
  } as unknown as NetworkService
}

// the proxy uniqueId is the only id the routes have: it keys the list, builds
// the detail link and addresses every kick/chat/connect call, so a player
// without one is dropped rather than rendered as an unusable row
function withPlayer(raw: unknown): OnlinePlayer | null {
  const player = asRecord(raw)
  const proxy = asRecord(player.networkPlayerProxyInfo)
  const uniqueId = asString(proxy.uniqueId)
  const name = asString(player.name)
  if (!uniqueId || !name) return null

  return {
    ...player,
    name,
    properties: asRecord(player.properties),
    firstLoginTimeMillis: asNumber(player.firstLoginTimeMillis),
    lastLoginTimeMillis: asNumber(player.lastLoginTimeMillis),
    networkPlayerProxyInfo: { ...proxy, uniqueId, name },
    connectedService: withService(player.connectedService),
    loginService: withService(player.loginService)
  } as unknown as OnlinePlayer
}

export const playerOnline = createServerFn({
  method: 'GET',
  strict: { output: false }
})
  .validator(
    z
      .object({
        limit: z.number().optional(),
        offset: z.number().optional(),
        sort: z.enum(['asc', 'desc']).optional()
      })
      .optional()
  )
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_bridge:player_read',
      'cloudnet_bridge:player_get_bulk',
      'global:admin'
    ])
    const payload = await cloudnetFetch<unknown>(
      `/player/online${query(data ?? {})}`
    )
    const list = asRecord(payload).onlinePlayers
    return {
      onlinePlayers: (Array.isArray(list) ? list : []).flatMap((entry) => {
        const player = withPlayer(entry)
        return player ? [player] : []
      })
    } satisfies OnlinePlayersSchema
  })

export const playerOnlineAmount = createServerFn({ method: 'GET' }).handler(
  async () => {
    requirePermissions([
      'cloudnet_bridge:player_read',
      'cloudnet_bridge:player_online_count',
      'global:admin'
    ])
    const payload = await cloudnetFetch<unknown>('/player/onlineCount')
    return {
      onlineCount: asNumber(asRecord(payload).onlineCount)
    } satisfies OnlinePlayersCount
  }
)

export const playerRegisteredAmount = createServerFn({
  method: 'GET'
}).handler(async () => {
  requirePermissions([
    'cloudnet_bridge:player_read',
    'cloudnet_bridge:player_registered_count',
    'global:admin'
  ])
  const payload = await cloudnetFetch<unknown>('/player/registeredCount')
  return {
    registeredCount: asNumber(asRecord(payload).registeredCount)
  } satisfies RegisteredPlayersCount
})

export const playerGet = createServerFn({
  method: 'GET',
  strict: { output: false }
})
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_bridge:player_read',
      'cloudnet_bridge:player_get',
      'global:admin'
    ])
    const payload = await cloudnetFetch<unknown>(
      `/player/online/${encodeURIComponent(data.id)}`
    )
    return withPlayer(payload)
  })

export const playerCommand = createServerFn({ method: 'POST' })
  .validator(
    z.object({ id: z.string(), command: z.string(), isProxy: z.boolean() })
  )
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_bridge:player_write',
      'cloudnet_bridge:player_send_command',
      'global:admin'
    ])
    return cloudnetFetch<void>(
      `/player/online/${encodeURIComponent(data.id)}/command?redirectToServer=${data.isProxy ? 'false' : 'true'}`,
      'POST',
      { command: data.command }
    )
  })

export const playerKick = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string(), message: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_bridge:player_write',
      'cloudnet_bridge:player_disconnect',
      'global:admin'
    ])
    return cloudnetFetch<void>(
      `/player/online/${encodeURIComponent(data.id)}/kick`,
      'POST',
      {
        kickMessage: data.message
      }
    )
  })

export const playerMessage = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string(), message: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_bridge:player_write',
      'cloudnet_bridge:player_send_chat',
      'global:admin'
    ])
    return cloudnetFetch<void>(
      `/player/online/${encodeURIComponent(data.id)}/sendChat`,
      'POST',
      {
        chatMessage: data.message
      }
    )
  })

export const playerConnect = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      id: z.string(),
      target: z.string(),
      serverSelector: z.enum(['HIGHEST_PLAYERS', 'LOWEST_PLAYERS', 'RANDOM']),
      type: z.enum(['task', 'group'])
    })
  )
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_bridge:player_write',
      'cloudnet_bridge:player_connect_group_task',
      'global:admin'
    ])
    // the node only accepts TASK / GROUP here
    return cloudnetFetch<void>(
      `/player/online/${encodeURIComponent(data.id)}/connect?target=${encodeURIComponent(data.target)}&serverSelector=${encodeURIComponent(data.serverSelector)}&type=${data.type.toUpperCase()}`,
      'POST'
    )
  })

export const playerConnectFallback = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_bridge:player_write',
      'cloudnet_bridge:player_connect_fallback',
      'global:admin'
    ])
    return cloudnetFetch<void>(
      `/player/online/${encodeURIComponent(data.id)}/connectFallback`,
      'POST'
    )
  })

export const playerConnectService = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string(), target: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_bridge:player_write',
      'cloudnet_bridge:player_connect_service',
      'global:admin'
    ])
    return cloudnetFetch<void>(
      `/player/online/${encodeURIComponent(data.id)}/connectService?target=${encodeURIComponent(data.target)}`,
      'POST'
    )
  })
