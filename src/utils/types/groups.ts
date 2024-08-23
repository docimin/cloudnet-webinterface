interface Group {
  properties: Record<string, unknown>
  templates: Template[]
  deployments: Deployment[]
  includes: Include[]
  name: string
  jvmOptions: string[]
  processParameters: string[]
  targetEnvironments: string[]
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

interface GroupsType {
  groups: Group[]
}
