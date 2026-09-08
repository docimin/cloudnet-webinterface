// GroupConfiguration is an allOf over the free-form JsonDocPropertyable and the
// 0.5.1 spec marks no field required, so only `name` is guaranteed here — and
// only because src/server/group.ts drops nameless entries. A group is handed
// straight back to POST /group, so the rest is passed through untouched.
interface Group {
  name: string
  properties?: Record<string, unknown>
  templates?: Template[]
  deployments?: Deployment[]
  includes?: Include[]
  jvmOptions?: string[]
  processParameters?: string[]
  environmentVariables?: Record<string, string>
  targetEnvironments?: string[]
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

// biome-ignore lint/correctness/noUnusedVariables: ambient global type, read by the dashboard route
interface GroupsType {
  groups: Group[]
}
