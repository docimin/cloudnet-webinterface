// ServiceTask is an allOf over the free-form JsonDocPropertyable and the 0.5.1
// spec marks no field required, so only `name` is guaranteed here — and only
// because src/server/task.ts drops nameless entries. A task is handed straight
// back to POST /task and POST /service/create/task, so the server layer must not
// invent values for the rest either.
export interface Task {
  name: string
  properties?: Record<string, unknown>
  templates?: Template[]
  deployments?: Deployment[]
  includes?: Include[]
  runtime?: string
  javaCommand?: string
  nameSplitter?: string
  disableIpRewrite?: boolean
  maintenance?: boolean
  autoDeleteOnStop?: boolean
  staticServices?: boolean
  groups?: string[]
  associatedNodes?: string[]
  deletedFilesAfterStop?: string[]
  processConfiguration?: ProcessConfiguration
  startPort?: number
  minServiceCount?: number
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
