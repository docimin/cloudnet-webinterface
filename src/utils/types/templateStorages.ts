// biome-ignore lint/correctness/noUnusedVariables: ambient global type, read by src/server/templates.ts
interface Storages {
  storages: string[]
}

// biome-ignore lint/correctness/noUnusedVariables: ambient global type, read by src/server/templates.ts
interface TemplatesList {
  templates: Templates[]
}

interface Templates {
  prefix: string
  name: string
  storage: string
  priority: number
  alwaysCopyToStaticServices: boolean
}
