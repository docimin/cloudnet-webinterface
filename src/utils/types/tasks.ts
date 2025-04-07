export interface Task {
  properties: Record<string, unknown>
  templates: Template[]
  deployments: Deployment[]
  includes: Include[]
  name: string
  pattern: string
  runtime: string
  javaCommand: string
  nameSplitter: string
  disableIpRewrite: boolean
  maintenance: boolean
  autoDeleteOnStop: boolean
  staticServices: boolean
  groups: string[]
  associatedNodes: string[]
  deletedFilesAfterStop: string[]
  processConfiguration: ProcessConfiguration
  startPort: number
  minServiceCount: number
}

export interface Template {
  prefix: string
  name: string
  storage: string
  priority: number
  alwaysCopyToStaticServices: boolean
}

export interface Deployment {
  properties: Record<string, unknown>
  template: Template
  excludes: string[]
}

export interface Include {
  properties: Record<string, unknown>
  url: string
  destination: string
}

export interface ProcessConfiguration {
  environment: string
  maxHeapMemorySize: number
  jvmOptions: string[]
  processParameters: string[]
  environmentVariables: Record<string, string>
}

export interface TasksType {
  tasks: Task[]
}
