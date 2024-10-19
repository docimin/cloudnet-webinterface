export interface Node {
  properties: Record<string, unknown>
  uniqueId: string
  listeners: Array<{ host: string; port: number }>
}

export interface Version {
  major: number
  minor: number
  patch: number
  revision: string
  versionType: string
  versionTitle: string
}

export interface Thread {
  id: number
  priority: number
  daemon: boolean
  name: string
  threadState:
    | 'NEW'
    | 'RUNNABLE'
    | 'BLOCKED'
    | 'WAITING'
    | 'TIMED_WAITING'
    | 'TERMINATED'
}

export interface ProcessSnapshot {
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

export interface Dependency {
  repo: string
  url: string
  group: string
  name: string
  version: string
}

export interface Repository {
  name: string
  url: string
}

export interface Module {
  runtimeModule: boolean
  storesSensitiveData: boolean
  group: string
  name: string
  version: string
  main: string
  description: string
  author: string
  website: string
  dataFolder: string
  repositories: Repository[]
  dependencies: Dependency[]
  minJavaVersionId: number
  properties: Record<string, unknown>
}

export interface NodeInfoSnapshot {
  properties: Record<string, unknown>
  creationTime: number
  startupMillis: number
  maxMemory: number
  usedMemory: number
  reservedMemory: number
  currentServicesCount: number
  drain: boolean
  node: Node
  version: Version
  processSnapshot: ProcessSnapshot
  maxCPUUsageToStartServices: number
  modules: Module[]
}

export interface Nodes {
  node: Node
  state: 'UNAVAILABLE' | 'SYNCING' | 'READY' | 'DISCONNECTED'
  head: boolean
  local: boolean
  nodeInfoSnapshot: NodeInfoSnapshot
}

export interface NodesType {
  nodes: Nodes[]
}
