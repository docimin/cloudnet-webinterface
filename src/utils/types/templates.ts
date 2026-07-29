// biome-ignore lint/correctness/noUnusedVariables: ambient global type, read by the templates components
interface FileType {
  path: string
  name: string
  directory: boolean
  hidden: boolean
  creationTime: number
  lastModified: number
  lastAccess: number
  size: number
}
