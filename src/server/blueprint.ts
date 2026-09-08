import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  ApiError,
  errorMessage,
  requirePermissions,
  type StepFailure,
  stepFailed
} from './cloudnet'
import {
  serviceAddDeployment,
  serviceCreateFromTaskName,
  serviceDelete,
  serviceDeployResources,
  serviceGet,
  serviceLifecycle
} from './service'
import { serviceVersionInstall } from './serviceVersion'
import { taskUpdate } from './task'
import { templateCreate } from './templates'

export const READY_TIMEOUT_MS = 90_000
const READY_POLL_MS = 2_000
const TEMPLATE_NAME = 'default'

// mirrors what CloudNet accepts as a task name and keeps it usable as a
// template prefix, which is a directory name on the node
const TASK_NAME = /^[A-Za-z0-9_-]{1,40}$/

export type BlueprintStep = 'createTemplate' | 'installVersion' | 'createTask'

export type BootstrapStep =
  | 'createService'
  | 'startService'
  | 'awaitReady'
  | 'addDeployment'
  | 'deployResources'

// how far the seed service got before its files were captured
export type ReadyState = 'online' | 'connected'

const templateRef = z.object({
  storage: z.string().min(1),
  prefix: z.string().min(1),
  name: z.string().min(1),
  priority: z.number().int(),
  alwaysCopyToStaticServices: z.boolean()
})

// `Online` is written by the bridge module once the platform finished booting,
// which is the point its default configuration files exist on disk. Without the
// bridge the only observable signal left is the wrapper attaching to the node,
// which happens earlier than that — the caller is told which of the two it got.
async function waitForReady(id: string) {
  const deadline = Date.now() + READY_TIMEOUT_MS
  let seen: ReadyState | null = null

  while (Date.now() < deadline) {
    const service = await serviceGet({ data: { id } })
    if (service?.properties.Online === true) return 'online' as const
    if (service?.lifeCycle === 'RUNNING' && (service.connectedTime ?? -1) > 0) {
      seen = 'connected'
    }
    await new Promise((resolve) => setTimeout(resolve, READY_POLL_MS))
  }

  return seen
}

async function removeSeed(id: string) {
  try {
    await serviceLifecycle({ data: { id, target: 'stop' } })
  } catch (error) {
    return errorMessage(error)
  }

  try {
    await serviceDelete({ data: { id } })
  } catch (error) {
    // a task with autoDeleteOnStop drops the service as part of the stop above
    if (error instanceof ApiError && error.status === 404) return null
    return errorMessage(error)
  }

  return null
}

// Creates the template a new task will read from, optionally installs a server
// version into it, then writes the task. javaCommand is passed through as null
// when the caller left it empty so the node uses the command it was configured
// with.
export const blueprintCreate = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      taskName: z.string().regex(TASK_NAME),
      storage: z.string().min(1).default('local'),
      environment: z.string().min(1),
      groups: z.array(z.string().min(1)),
      staticServices: z.boolean(),
      memory: z.number().int().min(50),
      minServiceCount: z.number().int().min(0),
      startPort: z.number().int().min(1).max(65535),
      javaCommand: z.string().min(1).nullable(),
      serviceVersionType: z.string().min(1).nullable(),
      serviceVersion: z.string().min(1).nullable()
    })
  )
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:task_write',
      'cloudnet_rest:task_create',
      'global:admin'
    ])

    const template = {
      storage: data.storage,
      prefix: data.taskName,
      name: TEMPLATE_NAME,
      priority: 0,
      alwaysCopyToStaticServices: false
    }

    try {
      await templateCreate({
        data: {
          storage: data.storage,
          prefix: data.taskName,
          name: TEMPLATE_NAME
        }
      })
    } catch (error) {
      return stepFailed<BlueprintStep>('createTemplate', error)
    }

    if (data.serviceVersionType && data.serviceVersion) {
      try {
        await serviceVersionInstall({
          data: {
            template,
            serviceVersionType: data.serviceVersionType,
            serviceVersion: data.serviceVersion,
            cache: true
          }
        })
      } catch (error) {
        return stepFailed<BlueprintStep>('installVersion', error)
      }
    }

    try {
      await taskUpdate({
        data: {
          task: {
            name: data.taskName,
            runtime: 'jvm',
            hostAddress: null,
            javaCommand: data.javaCommand,
            nameSplitter: '-',
            disableIpRewrite: false,
            maintenance: false,
            autoDeleteOnStop: !data.staticServices,
            staticServices: data.staticServices,
            groups: data.groups,
            associatedNodes: [],
            deletedFilesAfterStop: [],
            processConfiguration: {
              environment: data.environment,
              maxHeapMemorySize: data.memory,
              jvmOptions: [],
              processParameters: [],
              environmentVariables: {}
            },
            startPort: data.startPort,
            minServiceCount: data.minServiceCount,
            templates: [template],
            deployments: [],
            includes: [],
            properties: {}
          }
        }
      })
    } catch (error) {
      return stepFailed<BlueprintStep>('createTask', error)
    }

    return { ok: true as const, template }
  })

// Starts one throw-away service of the task so the platform writes its default
// configuration files, copies those back into the template, and removes the
// service again. The seed service is torn down on every path out of here,
// including a failure halfway through, and a teardown that itself failed is
// reported instead of swallowed.
export const blueprintBootstrap = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      taskName: z.string().regex(TASK_NAME),
      template: templateRef
    })
  )
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:service_write',
      'cloudnet_rest:service_deploy_resources',
      'global:admin'
    ])

    let created: Awaited<ReturnType<typeof serviceCreateFromTaskName>>
    try {
      created = await serviceCreateFromTaskName({
        data: { taskName: data.taskName }
      })
    } catch (error) {
      return {
        ...stepFailed<BootstrapStep>('createService', error),
        ready: null,
        cleanup: null
      }
    }

    const id = created.serviceInfo?.configuration.serviceId.uniqueId
    if (!id) {
      // a DEFERRED create hands back no snapshot, so there is nothing here to
      // drive or to clean up
      return {
        ...stepFailed<BootstrapStep>('createService', new Error(created.state)),
        ready: null,
        cleanup: null
      }
    }

    const capture = async (): Promise<
      StepFailure<BootstrapStep> | ReadyState
    > => {
      try {
        await serviceLifecycle({ data: { id, target: 'start' } })
      } catch (error) {
        return stepFailed<BootstrapStep>('startService', error)
      }

      let ready: ReadyState | null
      try {
        ready = await waitForReady(id)
      } catch (error) {
        return stepFailed<BootstrapStep>('awaitReady', error)
      }
      if (!ready) {
        return stepFailed<BootstrapStep>(
          'awaitReady',
          new Error(`no running service after ${READY_TIMEOUT_MS}ms`)
        )
      }

      try {
        await serviceAddDeployment({
          data: { id, flush: false, template: data.template, excludes: [] }
        })
      } catch (error) {
        return stepFailed<BootstrapStep>('addDeployment', error)
      }

      try {
        await serviceDeployResources({ data: { id, remove: true } })
      } catch (error) {
        return stepFailed<BootstrapStep>('deployResources', error)
      }

      return ready
    }

    let outcome: StepFailure<BootstrapStep> | ReadyState
    let cleanup: string | null = null
    try {
      outcome = await capture()
    } finally {
      cleanup = await removeSeed(id)
    }

    return typeof outcome === 'string'
      ? { ok: true as const, ready: outcome, cleanup }
      : { ...outcome, ready: null, cleanup }
  })
