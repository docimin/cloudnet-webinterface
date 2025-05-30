interface Service {
  properties: Properties
  creationTime: number
  address: Address
  connectAddress: Address
  processSnapshot: ProcessSnapshot
  configuration: Configuration
  processConfig: ProcessConfig
  runtime: string
  javaCommand: string
  autoDeleteOnStop: boolean
  staticService: boolean
  groups: string[]
  deletedFilesAfterStop: string[]
  templates: Template[]
  deployments: Deployment[]
  includes: Include[]
  port: number
  connectedTime: number
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
  retryConfiguration: RetryConfiguration
  serviceId: ServiceId
  eventReceivers: Record<string, unknown>
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

interface Properties {
  Online: boolean
  Motd: string
  Extra: string
  State: string
  'Max-Players': number
  Version: string
  'Online-Count': number
  Players: string[]
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

type ServiceLifeCycleUpdate = 'start' | 'restart' | 'stop'

type LifeCycle = 'PREPARED' | 'RUNNING' | 'STOPPED' | 'DELETED'

interface Services {
  services: Service[]
}

interface ServiceLogCache {
  lines: string[]
}
