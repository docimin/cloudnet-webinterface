interface Address {
  host: string
  port: number
}

interface Environment {
  properties: Record<string, unknown>
  name: string
  defaultServiceStartPort: number
  defaultProcessArguments: string[]
}

interface ServiceId {
  taskName: string
  nameSplitter: string
  environmentName: string
  allowedNodes: string[]
  uniqueId: string
  taskServiceId: number
  nodeUniqueId: string
  environment: Environment
}

interface NetworkService {
  groups: string[]
  serviceId: ServiceId
}

interface NetworkPlayerProxyInfo {
  uniqueId: string
  name: string
  xBoxId: string
  address: Address
  networkService: NetworkService
  version: number
  listener: Address
  onlineMode: boolean
}

interface labyModOptions {
  version: string
  creationTime: number
  joinSecret: string
}

interface OnlinePlayer {
  properties: { labyModOptions: labyModOptions }
  name: string
  firstLoginTimeMillis: number
  lastLoginTimeMillis: number
  lastNetworkPlayerProxyInfo: NetworkPlayerProxyInfo
  networkPlayerProxyInfo: NetworkPlayerProxyInfo
  connectedService: NetworkService
  networkPlayerServerInfo: NetworkPlayerProxyInfo
}

interface OnlinePlayersSchema {
  onlinePlayers: OnlinePlayer[]
}
