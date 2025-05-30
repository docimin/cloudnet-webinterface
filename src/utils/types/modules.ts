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

export interface Module {
  lifecycle: Lifecycle
  configuration: {
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
}
