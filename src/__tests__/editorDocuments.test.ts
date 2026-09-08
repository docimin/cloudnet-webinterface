import { describe, expect, test } from 'vitest'
import {
  mergeGroup,
  toGroupFormValues
} from '../components/editors/groupDocument'
import {
  buildTaskSchema,
  mergeTask,
  toTaskFormValues
} from '../components/editors/taskDocument'
import type { Task } from '../utils/types/tasks'

const messages = {
  runtimeRequired: 'runtime required',
  splitterRequired: 'splitter required',
  environmentRequired: 'environment required',
  startPortInvalid: 'bad port',
  maxMemoryInvalid: 'bad memory',
  minServiceCountInvalid: 'bad count',
  invalidJsonArray: 'bad json'
}

const task = {
  name: 'Lobby',
  runtime: 'jvm',
  javaCommand: 'java',
  nameSplitter: '-',
  maintenance: false,
  autoDeleteOnStop: true,
  staticServices: false,
  hostAddress: '127.0.0.1',
  associatedNodes: ['Node-1'],
  deletedFilesAfterStop: ['logs'],
  groups: ['Global-Server'],
  startPort: 25565,
  minServiceCount: 1,
  properties: { addedByAModule: { retention: 3 } },
  templates: [
    {
      prefix: 'Lobby',
      name: 'default',
      storage: 'local',
      priority: 0,
      alwaysCopyToStaticServices: false
    }
  ],
  deployments: [],
  includes: [],
  processConfiguration: {
    environment: 'MINECRAFT_SERVER',
    maxHeapMemorySize: 512,
    jvmOptions: ['-XX:+UseG1GC'],
    processParameters: ['--nogui'],
    environmentVariables: { TZ: 'UTC' }
  }
} as unknown as Task

describe('mergeTask', () => {
  test('keeps keys the form does not model', () => {
    const merged: Record<string, unknown> = {
      ...mergeTask(task, toTaskFormValues(task))
    }

    expect(merged.hostAddress).toBe('127.0.0.1')
    expect(merged.associatedNodes).toEqual(['Node-1'])
    expect(merged.deletedFilesAfterStop).toEqual(['logs'])
    expect(merged.properties).toEqual({ addedByAModule: { retention: 3 } })
  })

  test('leaves autoDeleteOnStop alone when static services are toggled', () => {
    const values = toTaskFormValues(task)
    const merged = mergeTask(task, { ...values, staticServices: true })

    expect(merged.staticServices).toBe(true)
    expect(merged.autoDeleteOnStop).toBe(true)
  })

  test('drops javaCommand instead of writing an empty one', () => {
    const values = toTaskFormValues(task)
    const merged = mergeTask(task, { ...values, javaCommand: '   ' })

    expect('javaCommand' in merged).toBe(false)
  })

  test('keeps a template key the panel does not model', () => {
    const withExtra = {
      ...task,
      templates: [{ ...task.templates?.[0], someModuleFlag: true }]
    } as unknown as Task
    const merged = mergeTask(withExtra, toTaskFormValues(withExtra))

    expect(merged.templates?.[0]).toMatchObject({ someModuleFlag: true })
  })

  test('falls back to the stored list when a raw JSON draft is unparseable', () => {
    const values = toTaskFormValues(task)
    const merged = mergeTask(
      { ...task, deployments: task.deployments },
      { ...values, deployments: undefined as unknown as unknown[] }
    )

    expect(merged.deployments).toEqual([])
  })
})

describe('buildTaskSchema', () => {
  const schema = buildTaskSchema(messages)
  const valid = toTaskFormValues(task)

  test('rejects a start port outside the range the node accepts', () => {
    expect(schema.safeParse({ ...valid, startPort: 0 }).success).toBe(false)
    expect(schema.safeParse({ ...valid, startPort: 65536 }).success).toBe(false)
    expect(schema.safeParse({ ...valid, startPort: 65535 }).success).toBe(true)
  })

  test('rejects a heap below the 50 MB the node requires', () => {
    expect(schema.safeParse({ ...valid, maxHeapMemorySize: 49 }).success).toBe(
      false
    )
    expect(schema.safeParse({ ...valid, maxHeapMemorySize: 50 }).success).toBe(
      true
    )
  })

  test('rejects a negative minimum service count', () => {
    expect(schema.safeParse({ ...valid, minServiceCount: -1 }).success).toBe(
      false
    )
  })

  test('rejects an empty runtime, splitter or environment', () => {
    expect(schema.safeParse({ ...valid, runtime: ' ' }).success).toBe(false)
    expect(schema.safeParse({ ...valid, nameSplitter: '' }).success).toBe(false)
    expect(schema.safeParse({ ...valid, environment: '' }).success).toBe(false)
  })
})

describe('mergeGroup', () => {
  const group = {
    name: 'Global-Server',
    targetEnvironments: ['MINECRAFT_SERVER'],
    jvmOptions: [],
    processParameters: [],
    environmentVariables: {},
    templates: [],
    deployments: [],
    includes: [],
    properties: { addedByAModule: true }
  } as unknown as Group

  test('keeps keys the form does not model', () => {
    const merged = mergeGroup(group, toGroupFormValues(group))

    expect(merged.name).toBe('Global-Server')
    expect(merged.properties).toEqual({ addedByAModule: true })
  })
})
