import { cookies } from 'next/headers'
import { Task, TasksType } from '@/utils/types/tasks'
import { Module, Modules } from '@/utils/types/modules'
import { Nodes, NodesType } from '@/utils/types/nodes'

export type ApiResponse<T = any, K extends keyof T = keyof T> = {
  [P in K]: T[P]
} & {
  data?: T
  status?: number
  title?: string
  type?: string
  detail?: string
}

class ApiError extends Error {
  constructor(
    public status: number,
    public title: string,
    public detail: string
  ) {
    super(detail)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.statusText,
      response.statusText
    )
  }

  const text = await response.text()
  if (!text) {
    throw new ApiError(
      response.status,
      response.statusText,
      response.statusText
    )
  }

  try {
    return JSON.parse(text)
  } catch (e) {
    throw new ApiError(
      response.status,
      response.statusText,
      response.statusText
    )
  }
}

export async function serverApiGet<T = any>(
  url: string,
  params?: Record<string, any>
): Promise<ApiResponse<T>> {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
  const cookie = await cookies()
  const accessToken = cookie.get('at')?.value
  const address = cookie.get('add')?.value

  if (!accessToken || !address) {
    throw new Error('Unauthorized')
  }

  const response = await fetch(
    `${decodeURIComponent(address)}${url}${queryString}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    }
  )
  return handleResponse(response)
}

export async function serverApiPost<T = any>(
  url: string,
  body: any
): Promise<ApiResponse<T>> {
  const cookie = await cookies()
  const accessToken = cookie.get('at')?.value
  const address = cookie.get('add')?.value

  if (!accessToken || !address) {
    throw new Error('Unauthorized')
  }

  const response = await fetch(`${decodeURIComponent(address)}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(body)
  })
  return handleResponse(response)
}

// User API
export const serverUserApi = {
  list: () => serverApiGet<Users>('/user'),
  get: (id: string) => serverApiGet<User>(`/user/${id}`)
}

// Auth API
export const serverAuthApi = {
  checkToken: () => serverApiPost('/api/auth/jwt', {}),
  createTicket: (type: 'service' | 'node') =>
    serverApiPost('/api/auth/ticket', { type }),
  getCookies: () => serverApiGet('/api/auth/getCookies'),
  getPermissions: () => serverApiGet<string[]>('/api/auth/getPermissions')
}

// Player API
export const serverPlayerApi = {
  online: (params?: {
    limit?: number
    offset?: number
    sort?: 'asc' | 'desc'
  }) => serverApiGet<OnlinePlayersSchema>('/player/online', params),
  onlineAmount: () => serverApiGet<OnlinePlayersCount>('/player/onlineCount'),
  get: (id: string) => serverApiGet<OnlinePlayer>(`/player/online/${id}`),
  registeredAmount: () =>
    serverApiGet<RegisteredPlayersCount>('/player/registeredCount')
}

// Module API
export const serverModuleApi = {
  get: (id: string) => serverApiGet<Module>(`/module/${id}`),
  getLoaded: () => serverApiGet<Modules>('/module/loaded'),
  getAvailable: () => serverApiGet<Modules>('/module/available'),
  getConfig: (id: string) => serverApiGet<Module>(`/module/${id}/config`),
  present: () => serverApiGet<Modules>('/module/present')
}

// Task API
export const serverTaskApi = {
  list: () => serverApiGet<TasksType>('/task'),
  get: (id: string) => serverApiGet<Task>(`/task/${id}`)
}

// Group API
export const serverGroupApi = {
  list: () => serverApiGet<GroupsType>('/group'),
  get: (id: string) => serverApiGet<Group>(`/group/${id}`)
}

// Service API
export const serverServiceApi = {
  list: () => serverApiGet<Services>('/service'),
  get: (id: string) => serverApiGet<Service>(`/service/${id}`),
  logLines: (id: string) =>
    serverApiGet<ServiceLogCache>(`/service/${id}/logLines`)
}

// Node API
export const serverNodeApi = {
  list: () => serverApiGet<NodesType>('/cluster'),
  get: (id: string) => serverApiGet<Nodes>(`/cluster/${id}`)
}

// Template Storage API
export const serverStorageApi = {
  getStorages: () => serverApiGet<Storages>('/templateStorage'),
  getTemplates: (id: string) =>
    serverApiGet<TemplatesList>(`/templateStorage/${id}/templates`),
  getLocalTemplates: () =>
    serverApiGet<TemplatesList>('/templateStorage/local/templates'),
  getSFTPTemplates: () =>
    serverApiGet<TemplatesList>('/templateStorage/sftp/templates'),
  getS3Templates: () =>
    serverApiGet<TemplatesList>('/templateStorage/s3/templates')
}
