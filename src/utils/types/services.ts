// ServiceInfoSnapshot is an allOf over the free-form JsonDocPropertyable and the
// 0.5.1 spec marks no field required. What is still typed as present here is
// filled in by src/server/service.ts before any route sees it; what a route
// never reads is left optional rather than faked.
interface Service {
  properties: Properties
  creationTime?: number
  address: Address
  connectAddress?: Address
  processSnapshot: ProcessSnapshot
  configuration: Configuration
  connectedTime?: number
  lifeCycle: LifeCycle
}

interface Address {
  host: string
  port: number
}

interface ProcessSnapshot {
  pid: number
  cpuUsage: number
  systemCpuUsage: number
  maxHeapMemory: number
  heapUsageMemory: number
  noHeapUsageMemory: number
  unloadedClassCount: number
  totalLoadedClassCount: number
  currentLoadedClassCount: number
  threads: Thread[]
}

interface Thread {
  id: number
  priority: number
  daemon: boolean
  name: string
  threadState: ThreadState
}

enum ThreadState {
  NEW = 'NEW',
  RUNNABLE = 'RUNNABLE',
  BLOCKED = 'BLOCKED',
  WAITING = 'WAITING',
  TIMED_WAITING = 'TIMED_WAITING',
  TERMINATED = 'TERMINATED'
}

interface Configuration {
  properties: Record<string, unknown>
  retryConfiguration?: RetryConfiguration
  serviceId: ServiceId
  processConfig?: ProcessConfig
  runtime: string
  javaCommand?: string
  autoDeleteOnStop?: boolean
  staticService?: boolean
  groups: string[]
  deletedFilesAfterStop?: string[]
  templates: Template[]
  deployments: Deployment[]
  includes: Include[]
  port?: number
}

interface RetryConfiguration {
  maxRetries: number
  backoffStrategy: number[]
}

interface ServiceId {
  taskName: string
  nameSplitter: string
  environmentName: string
  allowedNodes: string[]
  uniqueId: string
  taskServiceId: number
  nodeUniqueId: string
  environment: Environment
}

interface Environment {
  properties: Record<string, unknown>
  name: string
  defaultServiceStartPort: number
  defaultProcessArguments: string[]
}

// the bridge module writes these keys; on a node without it the whole document
// is empty, so nothing in here can be assumed present
interface Properties {
  Online?: boolean
  Motd?: string
  Extra?: string
  State?: string
  'Max-Players'?: number
  Version?: string
  'Online-Count'?: number
  Players?: string[]
}

interface ProcessConfig {
  environment: string
  maxHeapMemorySize: number
  jvmOptions: string[]
  processParameters: string[]
  environmentVariables: Record<string, string>
}

interface Template {
  prefix: string
  name: string
  storage: string
  priority: number
  alwaysCopyToStaticServices: boolean
}

interface Deployment {
  properties: Record<string, unknown>
  template: Template
  excludes: string[]
}

interface Include {
  properties: Record<string, unknown>
  url: string
  destination: string
}

type LifeCycle = 'PREPARED' | 'RUNNING' | 'STOPPED' | 'DELETED'

// biome-ignore lint/correctness/noUnusedVariables: ambient global type, read by src/server/service.ts
interface Services {
  services: Service[]
}

// biome-ignore lint/correctness/noUnusedVariables: ambient global type, read by src/server/service.ts
interface ServiceLogCache {
  lines: string[]
}
