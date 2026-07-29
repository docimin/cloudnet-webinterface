// the 0.5.1 spec marks no field required and builds the environment type on the
// free-form JsonDocPropertyable, so only `name` is guaranteed here — and only
// because the server layer normalises the payload and drops nameless entries
export interface ServiceVersion {
  name: string
  url?: string
  minJavaVersion?: number
  maxJavaVersion?: number
  deprecated?: boolean
  cacheFiles?: boolean
  properties?: Record<string, unknown>
  additionalDownloads?: Record<string, string>
}

export interface ServiceVersionType {
  name: string
  environmentType?: string
  installSteps?: string[]
  versions?: ServiceVersion[]
}

export interface ServiceVersionTypes {
  serviceVersionTypes: ServiceVersionType[]
}

export interface ServiceEnvironmentType {
  name: string
  defaultServiceStartPort?: number
  defaultProcessArguments?: string[]
  properties?: Record<string, unknown>
}

export interface ServiceEnvironments {
  environments: ServiceEnvironmentType[]
}
