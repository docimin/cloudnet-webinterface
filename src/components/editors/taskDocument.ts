import { z } from 'zod'
import type { Deployment, Include, Task, Template } from '@/utils/types/tasks'
import { asTemplateEntry, templateEntrySchema } from './templateEntry'

export interface TaskSchemaMessages {
  runtimeRequired: string
  splitterRequired: string
  environmentRequired: string
  startPortInvalid: string
  maxMemoryInvalid: string
  minServiceCountInvalid: string
  invalidJsonArray: string
}

// mirrors the node's own ServiceTask.Builder checks: a start port outside
// 1-65535 and a heap below 50 MB are rejected there, after the save has already
// been sent
export const buildTaskSchema = (messages: TaskSchemaMessages) =>
  z.object({
    runtime: z.string().trim().min(1, messages.runtimeRequired),
    javaCommand: z.string(),
    nameSplitter: z.string().trim().min(1, messages.splitterRequired),
    maintenance: z.boolean(),
    staticServices: z.boolean(),
    minServiceCount: z.number().int().min(0, messages.minServiceCountInvalid),
    startPort: z
      .number()
      .int()
      .min(1, messages.startPortInvalid)
      .max(65535, messages.startPortInvalid),
    groups: z.array(z.string()),
    templates: z.array(templateEntrySchema),
    environment: z.string().trim().min(1, messages.environmentRequired),
    maxHeapMemorySize: z.number().int().min(50, messages.maxMemoryInvalid),
    jvmOptions: z.array(z.string()),
    processParameters: z.array(z.string()),
    environmentVariables: z.record(z.string(), z.string()),
    deployments: z.array(z.unknown(), { error: messages.invalidJsonArray }),
    includes: z.array(z.unknown(), { error: messages.invalidJsonArray })
  })

export type TaskFormValues = z.infer<ReturnType<typeof buildTaskSchema>>

export function toTaskFormValues(task: Task): TaskFormValues {
  const process = task.processConfiguration
  return {
    runtime: task.runtime ?? 'jvm',
    javaCommand: task.javaCommand ?? '',
    nameSplitter: task.nameSplitter ?? '-',
    maintenance: task.maintenance ?? false,
    staticServices: task.staticServices ?? false,
    minServiceCount: task.minServiceCount ?? 0,
    startPort: task.startPort ?? 0,
    groups: task.groups ?? [],
    templates: (task.templates ?? []).map(asTemplateEntry),
    environment: process?.environment ?? '',
    maxHeapMemorySize: process?.maxHeapMemorySize ?? 512,
    jvmOptions: process?.jvmOptions ?? [],
    processParameters: process?.processParameters ?? [],
    environmentVariables: process?.environmentVariables ?? {},
    deployments: task.deployments ?? [],
    includes: task.includes ?? []
  }
}

// the stored document is spread first so keys the form does not model —
// hostAddress, associatedNodes, properties, anything a module added — survive
// the save
export function mergeTask(task: Task, values: TaskFormValues): Task {
  const merged: Task = {
    ...task,
    runtime: values.runtime.trim(),
    nameSplitter: values.nameSplitter.trim(),
    maintenance: values.maintenance,
    staticServices: values.staticServices,
    minServiceCount: values.minServiceCount,
    startPort: values.startPort,
    groups: values.groups,
    templates: values.templates as Template[],
    // an unparseable draft in the raw-JSON fields reads back as undefined; the
    // stored list stands in so switching tabs cannot drop the key
    deployments: (Array.isArray(values.deployments)
      ? values.deployments
      : task.deployments) as Deployment[],
    includes: (Array.isArray(values.includes)
      ? values.includes
      : task.includes) as Include[],
    processConfiguration: {
      ...task.processConfiguration,
      environment: values.environment.trim(),
      maxHeapMemorySize: values.maxHeapMemorySize,
      jvmOptions: values.jvmOptions,
      processParameters: values.processParameters,
      environmentVariables: values.environmentVariables
    }
  }

  // the node picks its own java binary when the key is absent, but would run an
  // empty string verbatim
  const javaCommand = values.javaCommand.trim()
  if (javaCommand) merged.javaCommand = javaCommand
  else delete merged.javaCommand

  return merged
}
