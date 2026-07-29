import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import type { Nodes } from '@/utils/types/nodes'
import { ApiError, cloudnetFetch, query, requirePermissions } from './cloudnet'

// the spec marks no field required and documents nodeInfoSnapshot as null for
// nodes that are registered but not connected. uniqueId keys React lists and
// fills the /nodes/$nodeId route param, so entries without one are dropped.
function asNode(raw: unknown): Nodes | null {
  if (!raw || typeof raw !== 'object') return null
  const entry = raw as Nodes
  const uniqueId = entry.node?.uniqueId
  if (typeof uniqueId !== 'string' || !uniqueId) return null

  const snapshot = entry.nodeInfoSnapshot
  return {
    ...entry,
    node: {
      ...entry.node,
      uniqueId,
      listeners: Array.isArray(entry.node.listeners) ? entry.node.listeners : []
    },
    nodeInfoSnapshot: snapshot && typeof snapshot === 'object' ? snapshot : null
  }
}

// an empty 2xx body resolves to `true`, so `lines` is never taken on trust
function asLines(payload: unknown): string[] {
  const lines = (payload as { lines?: unknown } | null)?.lines
  return Array.isArray(lines)
    ? lines.filter((line): line is string => typeof line === 'string')
    : []
}

// node entries carry a free-form `properties` document, which the output
// serializability check cannot prove
export const nodeList = createServerFn({
  method: 'GET',
  strict: { output: false }
}).handler(async () => {
  requirePermissions([
    'cloudnet_rest:cluster_read',
    'cloudnet_rest:cluster_node_list',
    'global:admin'
  ])
  const payload = await cloudnetFetch<unknown>('/cluster')
  const nodes = (payload as { nodes?: unknown } | null)?.nodes
  return {
    nodes: (Array.isArray(nodes) ? nodes : []).flatMap(
      (entry) => asNode(entry) ?? []
    )
  }
})

// 0.5.1 has no PUT /node/{id}. Changing a listener means reading the cluster
// entry and putting the whole NetworkClusterNode back to PUT /cluster.
export const nodeUpdate = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string(), ip: z.string(), port: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:cluster_read',
      'cloudnet_rest:cluster_node_get',
      'global:admin'
    ])
    requirePermissions([
      'cloudnet_rest:cluster_write',
      'cloudnet_rest:cluster_node_update',
      'global:admin'
    ])

    const port = Number(data.port)
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new ApiError(400, 'Invalid port')
    }

    const server = asNode(
      await cloudnetFetch<unknown>(`/cluster/${encodeURIComponent(data.id)}`)
    )
    // PUT /cluster identifies the entry by the uniqueId in the body
    if (!server) throw new ApiError(404, `Unknown node ${data.id}`)

    const [listener, ...rest] = server.node.listeners
    return cloudnetFetch<true>('/cluster', 'PUT', {
      ...server.node,
      listeners: [{ ...listener, host: data.ip, port }, ...rest]
    })
  })

// The old page path read /cluster/:id while the client path read /node/:id.
// Both are kept because they return different shapes.
export const nodeClusterGet = createServerFn({
  method: 'GET',
  strict: { output: false }
})
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:cluster_read',
      'cloudnet_rest:cluster_node_get',
      'global:admin'
    ])
    return asNode(
      await cloudnetFetch<unknown>(`/cluster/${encodeURIComponent(data.id)}`)
    )
  })

// draining is a required query flag, not a toggle — the caller sends the value
// it wants the node to end up in.
export const nodeDrain = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string(), draining: z.boolean() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:cluster_write',
      'cloudnet_rest:cluster_node_change_draining',
      'global:admin'
    ])
    return cloudnetFetch<true>(
      `/cluster/${encodeURIComponent(data.id)}/drain${query({ draining: data.draining })}`,
      'PATCH'
    )
  })

export const nodeCommand = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string(), command: z.string().min(1) }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:cluster_write',
      'cloudnet_rest:cluster_node_command',
      'global:admin'
    ])
    const payload = await cloudnetFetch<unknown>(
      `/cluster/${encodeURIComponent(data.id)}/command`,
      'POST',
      { command: data.command }
    )
    return { lines: asLines(payload) }
  })

// /node/* addresses the node that serves the request, never a cluster peer.
export const nodeConfigGet = createServerFn({
  method: 'GET',
  strict: { output: false }
}).handler(async () => {
  requirePermissions([
    'cloudnet_rest:node_read',
    'cloudnet_rest:node_config_get',
    'global:admin'
  ])
  const payload = await cloudnetFetch<unknown>('/node/config')
  // a 200 with an empty body resolves to `true`, which must not reach the editor
  return payload && typeof payload === 'object' && !Array.isArray(payload)
    ? (payload as Record<string, unknown>)
    : null
})

export const nodeConfigUpdate = createServerFn({ method: 'POST' })
  .validator(z.object({ config: z.record(z.string(), z.unknown()) }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:node_write',
      'cloudnet_rest:node_config_update',
      'global:admin'
    ])
    return cloudnetFetch<true>('/node/config', 'PUT', data.config)
  })

export const nodeReload = createServerFn({ method: 'POST' })
  .validator(z.object({ type: z.enum(['all', 'config']) }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:node_write',
      'cloudnet_rest:node_reload',
      'global:admin'
    ])
    return cloudnetFetch<true>(
      `/node/reload${query({ type: data.type })}`,
      'POST'
    )
  })

export const nodePing = createServerFn({ method: 'GET' }).handler(async () => {
  requirePermissions([
    'cloudnet_rest:node_read',
    'cloudnet_rest:node_ping',
    'global:admin'
  ])
  return cloudnetFetch<true>('/node/ping')
})

export const nodeLogLines = createServerFn({ method: 'GET' })
  .validator(z.object({ format: z.enum(['raw', 'ansi']) }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:node_read',
      'cloudnet_rest:node_log_lines',
      'global:admin'
    ])
    const payload = await cloudnetFetch<unknown>(
      `/node/logLines${query({ format: data.format })}`
    )
    return { lines: asLines(payload) }
  })
