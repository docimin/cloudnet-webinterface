interface Storages {
  storages: string[]
}

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
