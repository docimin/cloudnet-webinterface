import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { type Module, type ModuleEntry, Target } from '@/utils/types/modules'
import { cloudnetFetch, query, requirePermissions } from './cloudnet'

// the spec marks no field required and an empty 2xx body resolves to `true`, so
// every list is unwrapped defensively
function listOf(payload: unknown): unknown[] {
  const modules = (payload as { modules?: unknown } | null)?.modules
  return Array.isArray(modules) ? modules : []
}

// configuration.name keys React lists and fills the /modules/$moduleId route
// param, so modules without one are dropped
function asModule(raw: unknown): Module | null {
  if (!raw || typeof raw !== 'object') return null
  const entry = raw as Module
  const name = entry.configuration?.name
  return typeof name === 'string' && name ? entry : null
}

// Module.configuration.properties is arbitrary config JSON, which the output
// serializability check cannot prove; it serializes fine at runtime.
export const moduleLoaded = createServerFn({
  method: 'GET',
  strict: { output: false }
}).handler(async () => {
  requirePermissions([
    'cloudnet_rest:module_read',
    'cloudnet_rest:module_list_loaded',
    'global:admin'
  ])
  const payload = await cloudnetFetch<unknown>('/module/loaded')
  return { modules: listOf(payload).flatMap((entry) => asModule(entry) ?? []) }
})

// /module/available answers ModuleEntry, not the loaded ModuleInfo shape
export const moduleAvailable = createServerFn({ method: 'GET' }).handler(
  async () => {
    requirePermissions([
      'cloudnet_rest:module_read',
      'cloudnet_rest:module_list_available',
      'global:admin'
    ])
    const payload = await cloudnetFetch<unknown>('/module/available')
    return {
      modules: listOf(payload).flatMap((entry) => {
        const module = entry as ModuleEntry
        const name = module?.name
        return typeof name === 'string' && name ? [module] : []
      })
    }
  }
)

export const modulePresent = createServerFn({ method: 'GET' }).handler(
  async () => {
    requirePermissions([
      'cloudnet_rest:module_read',
      'cloudnet_rest:module_list_present',
      'global:admin'
    ])
    const payload = await cloudnetFetch<unknown>('/module/present')
    return {
      modules: listOf(payload).filter(
        (name): name is string => typeof name === 'string' && name.length > 0
      )
    }
  }
)

export const moduleReload = createServerFn({ method: 'POST' }).handler(
  async () => {
    requirePermissions([
      'cloudnet_rest:module_write',
      'cloudnet_rest:module_reload_all',
      'global:admin'
    ])
    return cloudnetFetch<true>('/module/reload', 'POST', {})
  }
)

export const moduleGet = createServerFn({
  method: 'GET',
  strict: { output: false }
})
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:module_read',
      'cloudnet_rest:module_get',
      'global:admin'
    ])
    return asModule(
      await cloudnetFetch<unknown>(`/module/${encodeURIComponent(data.id)}`)
    )
  })

// module configs are arbitrary JSON documents, which the output serializability
// check cannot prove
export const moduleGetConfig = createServerFn({
  method: 'GET',
  strict: { output: false }
})
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:module_read',
      'cloudnet_rest:module_config_get',
      'cloudnet_rest:module_config_get_sensitive',
      'global:admin'
    ])
    const payload = await cloudnetFetch<unknown>(
      `/module/${encodeURIComponent(data.id)}/config`
    )
    // modules without config support answer 400; an empty 200 body resolves to
    // `true`, which must not reach the editor as a config document
    return payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : null
  })

export const moduleLifecycle = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string(), target: z.enum(Target) }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:module_write',
      'cloudnet_rest:module_lifecycle',
      'global:admin'
    ])
    return cloudnetFetch<true>(
      `/module/${encodeURIComponent(data.id)}/lifecycle${query({ target: data.target })}`,
      'PATCH'
    )
  })

// upstream is PUT /module/${id}/config — matches the old route
export const moduleUpdate = createServerFn({ method: 'POST' })
  .validator(
    z.object({ id: z.string(), config: z.record(z.string(), z.unknown()) })
  )
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:module_write',
      'cloudnet_rest:module_config_update',
      'global:admin'
    ])
    return cloudnetFetch<true>(
      `/module/${encodeURIComponent(data.id)}/config`,
      'PUT',
      data.config
    )
  })

export const moduleUninstall = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:module_write',
      'cloudnet_rest:module_uninstall',
      'global:admin'
    ])
    return cloudnetFetch<true>(
      `/module/${encodeURIComponent(data.id)}/uninstall`,
      'POST',
      {}
    )
  })
