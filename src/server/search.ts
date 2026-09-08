import { createServerFn } from '@tanstack/react-start'
import type { Nodes } from '@/utils/types/nodes'
import type { Task } from '@/utils/types/tasks'
import { cloudnetFetch, getPermissions } from './cloudnet'

export type PaletteItem = {
  type: 'service' | 'task' | 'group' | 'node'
  id: string
  label: string
  sublabel?: string
}

const allowed = (permissions: string[], scopes: string[]) =>
  scopes.some((scope) => permissions.includes(scope))

// the spec marks no field required and an empty 2xx body resolves to `true`, so
// the wrapped list is unwrapped defensively before anything is read off it
function listOf<T>(payload: unknown, key: string): T[] {
  const list = (payload as Record<string, unknown> | null)?.[key]
  return Array.isArray(list) ? (list as T[]) : []
}

type PaletteResult = {
  items: PaletteItem[]
  canCreateService: boolean
}

export const paletteIndex = createServerFn({
  method: 'GET'
}).handler(async (): Promise<PaletteResult> => {
  const permissions = getPermissions()

  const sources: Array<[boolean, () => Promise<PaletteItem[]>]> = [
    [
      allowed(permissions, [
        'cloudnet_rest:service_read',
        'cloudnet_rest:service_list',
        'global:admin'
      ]),
      async () => {
        const res = await cloudnetFetch<unknown>('/service')
        // an id is the /services/$serviceId route param; a row without one
        // would navigate nowhere
        return listOf<Service>(res, 'services').flatMap((s) => {
          const id = s?.configuration?.serviceId
          if (!id?.uniqueId) return []
          const label = `${id.taskName ?? ''}${id.nameSplitter ?? ''}${id.taskServiceId ?? ''}`
          return [
            {
              type: 'service' as const,
              id: id.uniqueId,
              label: label || id.uniqueId,
              sublabel: id.nodeUniqueId
            }
          ]
        })
      }
    ],
    [
      allowed(permissions, [
        'cloudnet_rest:task_read',
        'cloudnet_rest:task_list',
        'global:admin'
      ]),
      async () => {
        const res = await cloudnetFetch<unknown>('/task')
        return listOf<Task>(res, 'tasks').flatMap((t) =>
          t?.name ? [{ type: 'task' as const, id: t.name, label: t.name }] : []
        )
      }
    ],
    [
      allowed(permissions, [
        'cloudnet_rest:group_read',
        'cloudnet_rest:group_list',
        'global:admin'
      ]),
      async () => {
        const res = await cloudnetFetch<unknown>('/group')
        return listOf<Group>(res, 'groups').flatMap((g) =>
          g?.name ? [{ type: 'group' as const, id: g.name, label: g.name }] : []
        )
      }
    ],
    [
      allowed(permissions, [
        'cloudnet_rest:cluster_read',
        'cloudnet_rest:cluster_node_list',
        'global:admin'
      ]),
      async () => {
        const res = await cloudnetFetch<unknown>('/cluster')
        return listOf<Nodes>(res, 'nodes').flatMap((n) => {
          const uniqueId = n?.node?.uniqueId
          if (!uniqueId) return []
          return [
            {
              type: 'node' as const,
              id: uniqueId,
              label: uniqueId,
              sublabel: n.state
            }
          ]
        })
      }
    ]
  ]

  // Per-source .catch: one unreachable endpoint must degrade that group, not blank the whole palette.
  const results = await Promise.all(
    sources.map(([permitted, load]) =>
      permitted ? load().catch(() => []) : Promise.resolve([])
    )
  )

  // union of the scopes the create route accepts, so the palette never offers a
  // verb that lands on its no-access screen
  const canCreateService = allowed(permissions, [
    'cloudnet_rest:service_write',
    'cloudnet_rest:service_create_task_name',
    'cloudnet_rest:service_create_task',
    'global:admin'
  ])

  return { items: results.flat(), canCreateService }
})
