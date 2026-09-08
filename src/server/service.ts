import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  cloudnetFetch,
  query,
  requirePermissions,
  stepFailed
} from './cloudnet'
import { templateCreate } from './templates'

export type ServiceCreateResult = {
  state: 'CREATED' | 'DEFERRED' | 'FAILED'
  creationId: string
  serviceInfo: Service | null
}

const serviceTemplate = z.object({
  storage: z.string().min(1),
  prefix: z.string().min(1),
  name: z.string().min(1),
  priority: z.number().int(),
  alwaysCopyToStaticServices: z.boolean()
})

// Every service schema in 0.5.1 is an allOf over the free-form
// JsonDocPropertyable and none of them declare `required`, so a nested object or
// list the routes walk into can be missing outright. The detail and list pages
// dereference `configuration.serviceId`, `processSnapshot`, `address` and the
// three resource lists without guards, so the shape is rebuilt here once instead
// of being made optional in a dozen components.
const doc = <T>(value: unknown): Partial<T> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Partial<T>)
    : {}

const list = <T>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : []

const NO_PROCESS: ProcessSnapshot = {
  pid: 0,
  cpuUsage: 0,
  systemCpuUsage: 0,
  maxHeapMemory: 0,
  heapUsageMemory: 0,
  noHeapUsageMemory: 0,
  unloadedClassCount: 0,
  totalLoadedClassCount: 0,
  currentLoadedClassCount: 0,
  threads: []
}

const asTemplate = (raw: unknown): Template => ({
  storage: '',
  prefix: '',
  name: '',
  priority: 0,
  alwaysCopyToStaticServices: false,
  ...doc<Template>(raw)
})

const asDeployment = (raw: unknown): Deployment => {
  const deployment = doc<Deployment>(raw)
  return {
    ...deployment,
    properties: doc<Record<string, unknown>>(deployment.properties),
    template: asTemplate(deployment.template),
    excludes: list<string>(deployment.excludes)
  }
}

const asInclude = (raw: unknown): Include => {
  const include = doc<Include>(raw)
  return {
    ...include,
    properties: doc<Record<string, unknown>>(include.properties),
    url: include.url ?? '',
    destination: include.destination ?? ''
  }
}

function asService(raw: unknown): Service | null {
  const snapshot = doc<Service>(raw)
  const configuration = doc<Configuration>(snapshot.configuration)
  const serviceId = doc<ServiceId>(configuration.serviceId)
  // uniqueId keys the table and addresses the detail route; a snapshot without
  // one can neither be rendered nor acted on
  if (typeof serviceId.uniqueId !== 'string' || !serviceId.uniqueId) return null

  return {
    ...snapshot,
    properties: doc<Properties>(snapshot.properties),
    address: { host: '', port: 0, ...doc<Address>(snapshot.address) },
    processSnapshot: {
      ...NO_PROCESS,
      ...doc<ProcessSnapshot>(snapshot.processSnapshot)
    },
    // matches what serviceStatus() already falls back to for an unknown state
    lifeCycle: snapshot.lifeCycle ?? 'STOPPED',
    configuration: {
      ...configuration,
      properties: doc<Record<string, unknown>>(configuration.properties),
      serviceId: {
        taskName: '',
        nameSplitter: '',
        environmentName: '',
        taskServiceId: 0,
        nodeUniqueId: '',
        ...serviceId,
        uniqueId: serviceId.uniqueId,
        allowedNodes: list<string>(serviceId.allowedNodes),
        environment: {
          properties: {},
          name: '',
          defaultServiceStartPort: 0,
          defaultProcessArguments: [],
          ...doc<Environment>(serviceId.environment)
        }
      },
      runtime: configuration.runtime ?? '',
      groups: list<string>(configuration.groups),
      templates: list(configuration.templates).map(asTemplate),
      deployments: list(configuration.deployments).map(asDeployment),
      includes: list(configuration.includes).map(asInclude)
    }
  }
}

const CREATE_STATES = ['CREATED', 'DEFERRED', 'FAILED'] as const

// the create endpoints answer 200 only once the node accepted the request, so a
// body without a usable state still means "accepted, look it up in the list"
function asCreateResult(raw: unknown): ServiceCreateResult {
  const result = doc<ServiceCreateResult>(raw)
  const serviceInfo = asService(result.serviceInfo)
  const state = CREATE_STATES.find((entry) => entry === result.state)
  return {
    state: state ?? (serviceInfo ? 'CREATED' : 'DEFERRED'),
    creationId: typeof result.creationId === 'string' ? result.creationId : '',
    serviceInfo
  }
}

// Service carries Record<string, unknown> bags that Start's output
// serialization check rejects. Input validation stays strict.
export const serviceList = createServerFn({
  method: 'GET',
  strict: { output: false } as const
}).handler(async () => {
  requirePermissions([
    'cloudnet_rest:service_read',
    'cloudnet_rest:service_list',
    'global:admin'
  ])
  const payload = await cloudnetFetch<unknown>('/service')
  const raw = (payload as { services?: unknown } | null)?.services
  return {
    services: list(raw).flatMap((entry) => asService(entry) ?? [])
  }
})

export const serviceGet = createServerFn({
  method: 'GET',
  strict: { output: false } as const
})
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:service_read',
      'cloudnet_rest:service_get',
      'global:admin'
    ])
    return asService(
      await cloudnetFetch<unknown>(`/service/${encodeURIComponent(data.id)}`)
    )
  })

// The lifecycle, resource and command endpoints all answer 204 with an empty
// body, which cloudnetFetch resolves to `true`. Anything other than a 2xx has
// already thrown by the time these return, so success is the only outcome left.
export const serviceCommand = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string(), command: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:service_write',
      'cloudnet_rest:service_send_commands',
      'global:admin'
    ])
    await cloudnetFetch<unknown>(
      `/service/${encodeURIComponent(data.id)}/command`,
      'POST',
      {
        command: data.command
      }
    )
    return true
  })

export const serviceDelete = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:service_write',
      'cloudnet_rest:service_delete',
      'global:admin'
    ])
    await cloudnetFetch<unknown>(
      `/service/${encodeURIComponent(data.id)}`,
      'DELETE'
    )
    return true
  })

export const serviceLifecycle = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      id: z.string(),
      target: z.enum(['start', 'restart', 'stop'])
    })
  )
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:service_write',
      'cloudnet_rest:service_lifecycle',
      'global:admin'
    ])
    await cloudnetFetch<unknown>(
      `/service/${encodeURIComponent(data.id)}/lifecycle${query({ target: data.target })}`,
      'PATCH'
    )
    return true
  })

export const serviceCreateFromTaskName = createServerFn({
  method: 'POST',
  strict: { output: false } as const
})
  .validator(z.object({ taskName: z.string().min(1) }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:service_write',
      'cloudnet_rest:service_create_task_name',
      'global:admin'
    ])
    return asCreateResult(
      await cloudnetFetch<unknown>('/service/create/taskName', 'POST', {
        taskName: data.taskName
      })
    )
  })

// The upstream body is a whole ServiceTask; the client sends back the task it
// picked with the overrides applied.
export const serviceCreateFromTask = createServerFn({
  method: 'POST',
  strict: { output: false } as const
})
  .validator(z.object({ task: z.unknown(), start: z.boolean() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:service_write',
      'cloudnet_rest:service_create_task',
      'global:admin'
    ])
    return asCreateResult(
      await cloudnetFetch<unknown>(
        `/service/create/task${query({ start: data.start })}`,
        'POST',
        data.task
      )
    )
  })

export const serviceAddTemplate = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      id: z.string(),
      flush: z.boolean(),
      template: serviceTemplate
    })
  )
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:service_write',
      'cloudnet_rest:service_add_template',
      'global:admin'
    ])
    await cloudnetFetch<unknown>(
      `/service/${encodeURIComponent(data.id)}/add/template${query({ flush: data.flush })}`,
      'POST',
      data.template
    )
    return true
  })

export const serviceAddInclusion = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      id: z.string(),
      flush: z.boolean(),
      url: z.string().min(1),
      destination: z.string().min(1)
    })
  )
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:service_write',
      'cloudnet_rest:service_add_inclusion',
      'global:admin'
    ])
    await cloudnetFetch<unknown>(
      `/service/${encodeURIComponent(data.id)}/add/inclusion${query({ flush: data.flush })}`,
      'POST',
      { url: data.url, destination: data.destination }
    )
    return true
  })

export const serviceAddDeployment = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      id: z.string(),
      flush: z.boolean(),
      template: serviceTemplate,
      excludes: z.array(z.string())
    })
  )
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:service_write',
      'cloudnet_rest:service_add_deployment',
      'global:admin'
    ])
    await cloudnetFetch<unknown>(
      `/service/${encodeURIComponent(data.id)}/add/deployment${query({ flush: data.flush })}`,
      'POST',
      { template: data.template, excludes: data.excludes }
    )
    return true
  })

export const serviceInclude = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      id: z.string(),
      type: z.enum(['templates', 'inclusions'])
    })
  )
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:service_write',
      'cloudnet_rest:service_include',
      'global:admin'
    ])
    await cloudnetFetch<unknown>(
      `/service/${encodeURIComponent(data.id)}/include${query({ type: data.type })}`,
      'POST'
    )
    return true
  })

export const serviceDeployResources = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string(), remove: z.boolean() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:service_write',
      'cloudnet_rest:service_deploy_resources',
      'global:admin'
    ])
    await cloudnetFetch<unknown>(
      `/service/${encodeURIComponent(data.id)}/deployResources${query({ remove: data.remove })}`,
      'POST'
    )
    return true
  })

export const serviceDeleteFiles = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:service_write',
      'cloudnet_rest:service_delete_files',
      'global:admin'
    ])
    await cloudnetFetch<unknown>(
      `/service/${encodeURIComponent(data.id)}/deleteFiles`,
      'DELETE'
    )
    return true
  })

// a slash would be percent-encoded into the template path and end up as a
// literal directory name rather than the nesting the user meant
const templateSegment = z
  .string()
  .min(1)
  .regex(/^[^/\\]+$/)

export type SaveAsTemplateStep =
  | 'createTemplate'
  | 'addDeployment'
  | 'deployResources'

// Snapshots what the service has on disk right now into a template: create the
// target, attach a one-shot deployment pointing at it, then flush every pending
// deployment and drop them again (remove=true) so the one-shot is not left
// behind in the service configuration.
export const serviceSaveAsTemplate = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      id: z.string(),
      storage: templateSegment,
      prefix: templateSegment,
      name: templateSegment
    })
  )
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:service_write',
      'cloudnet_rest:service_deploy_resources',
      'global:admin'
    ])

    const template = {
      storage: data.storage,
      prefix: data.prefix,
      name: data.name,
      priority: 0,
      alwaysCopyToStaticServices: false
    }

    try {
      await templateCreate({
        data: { storage: data.storage, prefix: data.prefix, name: data.name }
      })
    } catch (error) {
      return stepFailed<SaveAsTemplateStep>('createTemplate', error)
    }

    try {
      await serviceAddDeployment({
        data: { id: data.id, flush: false, template, excludes: [] }
      })
    } catch (error) {
      return stepFailed<SaveAsTemplateStep>('addDeployment', error)
    }

    try {
      await serviceDeployResources({ data: { id: data.id, remove: true } })
    } catch (error) {
      return stepFailed<SaveAsTemplateStep>('deployResources', error)
    }

    return { ok: true as const, template }
  })

export const serviceLogLines = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:service_read',
      'cloudnet_rest:service_log_lines',
      'global:admin'
    ])
    const payload = await cloudnetFetch<unknown>(
      `/service/${encodeURIComponent(data.id)}/logLines`
    )
    const lines = (payload as { lines?: unknown } | null)?.lines
    return {
      lines: list(lines).filter(
        (line): line is string => typeof line === 'string'
      )
    }
  })
