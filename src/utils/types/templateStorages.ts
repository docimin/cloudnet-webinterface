export interface Storages {
  storages: string[]
}

export interface TemplatesList {
  templates: Templates[]
}

export interface Templates {
  prefix: string
  name: string
  storage: string
  priority: number
  alwaysCopyToStaticServices: boolean
}
