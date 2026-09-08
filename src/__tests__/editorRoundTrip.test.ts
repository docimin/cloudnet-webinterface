import { describe, expect, test } from 'vitest'
import {
  mergeGroup,
  toGroupFormValues
} from '../components/editors/groupDocument'
import { mergeTask, toTaskFormValues } from '../components/editors/taskDocument'
import type { Task } from '../utils/types/tasks'

function paths(value: unknown, prefix = ''): Record<string, unknown> {
  if (!value || typeof value !== 'object') return { [prefix]: value }
  if (Array.isArray(value)) {
    return Object.assign(
      {},
      ...value.map((item, index) => paths(item, `${prefix}[${index}]`))
    )
  }
  const entries = Object.entries(value as Record<string, unknown>)
  if (entries.length === 0) return { [prefix]: '{}' }
  return Object.assign(
    {},
    ...entries.map(([key, item]) => paths(item, `${prefix}.${key}`))
  )
}

const hostile = {
  name: 'Lobby',
  runtime: 'jvm',
  javaCommand: 'java',
  nameSplitter: '-',
  maintenance: false,
  staticServices: false,
  autoDeleteOnStop: true,
  disableIpRewrite: true,
  hostAddress: '127.0.0.1',
  associatedNodes: ['Node-1'],
  deletedFilesAfterStop: ['logs'],
  groups: ['Global-Server'],
  startPort: 25565,
  minServiceCount: 1,
  properties: { moduleA: { retention: 3, nested: { deep: [1, 2] } } },
  unknownRootScalar: 'keepme',
  unknownRootObject: { a: 1, b: [true, null, 'x'] },
  templates: [
    {
      prefix: 'Lobby',
      name: 'default',
      storage: 'local',
      priority: 4,
      alwaysCopyToStaticServices: true,
      unknownTemplateKey: { nested: 'yes' }
    }
  ],
  deployments: [
    {
      template: { prefix: 'Lobby', name: 'backup', storage: 'local' },
      excludes: ['logs'],
      unknownDeploymentKey: 42
    }
  ],
  includes: [
    { url: 'https://x/y.jar', destination: 'plugins/y.jar', extra: 1 }
  ],
  processConfiguration: {
    environment: 'MINECRAFT_SERVER',
    maxHeapMemorySize: 512,
    jvmOptions: ['-XX:+UseG1GC'],
    processParameters: ['--nogui'],
    environmentVariables: { TZ: 'UTC' },
    unknownProcessKey: { keep: true }
  }
} as unknown as Task

describe('adversarial task round trip', () => {
  test('no key path from the stored document is lost or altered', () => {
    const merged = mergeTask(hostile, toTaskFormValues(hostile))
    const before = paths(hostile)
    const after = paths(merged)

    const lost = Object.keys(before).filter((key) => !(key in after))
    expect(lost).toEqual([])

    const changed = Object.keys(before).filter(
      (key) => before[key] !== after[key]
    )
    expect(changed).toEqual([])
  })

  test('idempotent across two passes', () => {
    const once = mergeTask(hostile, toTaskFormValues(hostile))
    const twice = mergeTask(once, toTaskFormValues(once))
    expect(paths(twice)).toEqual(paths(once))
  })
})

describe('adversarial group round trip', () => {
  const group = {
    name: 'Global-Server',
    targetEnvironments: ['MINECRAFT_SERVER'],
    jvmOptions: ['-Xmx1G'],
    processParameters: ['--nogui'],
    environmentVariables: { TZ: 'UTC' },
    templates: [
      {
        prefix: 'Global',
        name: 'server',
        storage: 'local',
        priority: 2,
        alwaysCopyToStaticServices: false,
        unknownTemplateKey: 'keep'
      }
    ],
    deployments: [{ excludes: [], unknownDeploymentKey: 7 }],
    includes: [{ url: 'https://a/b', destination: 'c', extra: true }],
    properties: { moduleB: { nested: [1, { deep: 'x' }] } },
    unknownGroupKey: 'survive'
  } as unknown as Group

  test('no key path from the stored document is lost or altered', () => {
    const merged = mergeGroup(group, toGroupFormValues(group))
    const before = paths(group)
    const after = paths(merged)

    expect(Object.keys(before).filter((key) => !(key in after))).toEqual([])
    expect(
      Object.keys(before).filter((key) => before[key] !== after[key])
    ).toEqual([])
  })
})
