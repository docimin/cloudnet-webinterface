import { cookies } from 'next/headers'
import { Task, TasksType } from '@/utils/types/tasks'
import { Module, Modules } from '@/utils/types/modules'

export type ApiResponse<T = any, K extends keyof T = keyof T> = {
  [P in K]: T[P]
} & {
  status?: number
  title?: string
  type?: string
  detail?: string
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const text = await response.text()
  if (!text) {
    throw new Error('Empty response received')
  }

  try {
    return JSON.parse(text)
  } catch (e) {
    throw new Error(`Failed to parse JSON response: ${text}`)
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
        Authorization: `Bearer ${accessToken}`,
      },
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
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  })
  return handleResponse(response)
}

// User API
export const serverUserApi = {
  list: () => serverApiGet('/api/user/list'),
  get: (id: string) => serverApiGet(`/api/user/${id}/get`),
  create: (body: any) => serverApiPost('/api/user/create', body),
  update: (id: string, body: any) =>
    serverApiPost(`/api/user/${id}/update`, body),
  delete: (id: string) => serverApiPost(`/api/user/${id}/delete`, {}),
}

// Auth API
export const serverAuthApi = {
  checkToken: () => serverApiPost('/api/auth/jwt', {}),
  createTicket: (type: 'service' | 'node') =>
    serverApiPost('/api/auth/ticket', { type }),
  getCookies: () => serverApiGet('/api/auth/getCookies'),
  getPermissions: () => serverApiGet<string[]>('/api/auth/getPermissions'),
}

// Player API
export const serverPlayerApi = {
  sendMessage: (id: string, message: string) =>
    serverApiPost(`/api/player/${id}/message`, { message }),
  kick: (id: string, message: string) =>
    serverApiPost(`/api/player/${id}/kick`, { message }),
  execute: (id: string, command: string) =>
    serverApiPost(`/api/player/${id}/command`, { command }),
  sendTaskGroup: (id: string, taskGroup: string) =>
    serverApiPost(`/api/player/${id}/connect`, { taskGroup }),
  sendFallback: (id: string) =>
    serverApiPost(`/api/player/${id}/connectFallback`, {}),
  sendService: (id: string, service: string) =>
    serverApiPost(`/api/player/${id}/connectService`, { service }),
  online: (params?: {
    limit?: number
    offset?: number
    sort?: 'asc' | 'desc'
  }) => serverApiGet('/api/player/online', params),
  onlineAmount: () => serverApiGet('/api/player/online/amount'),
}

// Module API
export const serverModuleApi = {
  getLoaded: () => serverApiGet<Modules>('/api/module/loaded'),
  getAvailable: () => serverApiGet<Modules>('/api/module/available'),
  getInfo: (id: string) => serverApiGet<Module>(`/api/module/${id}`),
  getConfig: (id: string) => serverApiGet<Module>(`/api/module/${id}/config`),
  present: () => serverApiGet<Modules>('/api/module/present'),
  updateLifecycle: (id: string, body: any) =>
    serverApiPost(`/api/module/${id}/lifecycle`, body),
  updateConfig: (id: string, body: any) =>
    serverApiPost(`/api/module/${id}/config`, body),
  uninstall: (id: string) => serverApiPost(`/api/module/${id}/uninstall`, {}),
  reload: () => serverApiPost(`/api/module/reload`, {}),
}

// Task API
export const serverTaskApi = {
  list: () => serverApiGet<TasksType>('/task'),
  get: (id: string) => serverApiGet<Task>(`/task/${id}`),
  update: (body: any) => serverApiPost('/task/update', body),
  delete: (id: string) => serverApiPost(`/task/${id}/delete`, {}),
}

// Group API
export const serverGroupApi = {
  list: () => serverApiGet<GroupsType>('/api/group/list'),
  get: (id: string) => serverApiGet<Group>(`/api/group/${id}/get`),
  update: (body: any) => serverApiPost(`/api/group/update`, body),
  delete: (id: string) => serverApiPost(`/api/group/${id}/delete`, {}),
}

// Service API
export const serverServiceApi = {
  list: () => serverApiGet<Service[]>('/api/service/list'),
  get: (id: string) => serverApiGet<Service>(`/api/service/${id}/get`),
  logLines: (id: string) =>
    serverApiGet<ServiceLogCache>(`/api/service/${id}/logLines`),
  delete: (id: string) => serverApiPost(`/api/service/${id}/delete`, {}),
  execute: (id: string, command: string) =>
    serverApiPost(`/api/service/${id}/command`, { command }),
}

// Node API
export const serverNodeApi = {
  list: () => serverApiGet('/api/node/list'),
  get: (id: string) => serverApiGet(`/api/node/${id}/get`),
  update: (id: string, ip: string, port: string) =>
    serverApiPost(`/api/node/${id}/update`, { ip, port }),
}
