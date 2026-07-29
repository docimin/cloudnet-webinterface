import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import type { Task } from '@/utils/types/tasks'
import { cloudnetFetch, requirePermissions } from './cloudnet'

// the spec marks no field of ServiceTask required, so anything without a usable
// name is dropped here: `name` keys the table, addresses the detail route and
// feeds the Radix SelectItem on the create-service page, which throws on an
// empty value. Everything else is passed through verbatim — both the detail page
// and the create-service page hand the document straight back to the node, so
// invented defaults would be written into a real task.
function asTask(raw: unknown): Task | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const task = raw as Task
  return typeof task.name === 'string' && task.name ? task : null
}

// tasks carry a free-form `properties` document that Start's output
// serialization check cannot prove
export const taskList = createServerFn({
  method: 'GET',
  strict: { output: false } as const
}).handler(async () => {
  requirePermissions([
    'cloudnet_rest:task_read',
    'cloudnet_rest:task_list',
    'global:admin'
  ])
  const payload = await cloudnetFetch<unknown>('/task')
  const raw = (payload as { tasks?: unknown } | null)?.tasks
  return {
    tasks: (Array.isArray(raw) ? raw : []).flatMap(
      (entry) => asTask(entry) ?? []
    )
  }
})

export const taskGet = createServerFn({
  method: 'GET',
  strict: { output: false } as const
})
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:task_read',
      'cloudnet_rest:task_get',
      'global:admin'
    ])
    return asTask(
      await cloudnetFetch<unknown>(`/task/${encodeURIComponent(data.id)}`)
    )
  })

export const taskUpdate = createServerFn({ method: 'POST' })
  .validator(z.object({ task: z.unknown() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:task_write',
      'cloudnet_rest:task_create',
      'global:admin'
    ])
    // 204 with an empty body; reaching here at all means the node accepted it
    await cloudnetFetch<unknown>('/task', 'POST', data.task)
    return true
  })

export const taskDelete = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:task_write',
      'cloudnet_rest:task_delete',
      'global:admin'
    ])
    await cloudnetFetch<unknown>(
      `/task/${encodeURIComponent(data.id)}`,
      'DELETE'
    )
    return true
  })
