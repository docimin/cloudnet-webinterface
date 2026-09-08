export interface Modules {
  modules: Module[]
}

export enum Lifecycle {
  CREATED = 'CREATED',
  LOADED = 'LOADED',
  STARTED = 'STARTED',
  RELOADING = 'RELOADING',
  STOPPED = 'STOPPED',
  UNLOADED = 'UNLOADED',
  UNUSEABLE = 'UNUSEABLE'
}

export enum Target {
  START = 'START',
  STOP = 'STOP',
  RELOAD = 'RELOAD',
  UNLOAD = 'UNLOAD'
}

interface Repository {
  name: string
  url: string
}

interface Dependency {
  repo: string
  url: string
  group: string
  name: string
  version: string
}

// /module/available answers these, not the loaded Module shape. Only `name` is
// guaranteed — src/server/module.ts drops entries without one and passes the
// rest through untouched.
export interface ModuleEntry {
  name: string
  official?: boolean
  website?: string
  version?: string
  sha3256?: string
  description?: string
  url?: string
  maintainers?: string[]
  releaseNotes?: string[]
  dependingModules?: string[]
}

// ModuleInfo is an allOf over the free-form JsonDocPropertyable and the 0.5.1
// spec marks no field required, so only `configuration.name` is guaranteed here
// — and only because src/server/module.ts drops entries without one. The rest is
// passed through verbatim, so it stays optional rather than being faked.
export interface Module {
  lifecycle?: Lifecycle
  configuration: {
    name: string
    runtimeModule?: boolean
    storesSensitiveData?: boolean
    group?: string
    version?: string
    main?: string
    description?: string
    author?: string
    website?: string
    dataFolder?: string
    repositories?: Repository[]
    dependencies?: Dependency[]
    minJavaVersionId?: number
    properties?: Record<string, unknown>
  }
}
