import { Task, TasksType } from '@/utils/types/tasks'

export type ApiResponse<T = any, K extends keyof T = keyof T> = {
  [P in K]: T[P]
} & {
  data?: T
  status: number
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

export async function apiGet<T = any>(
  url: string,
  params?: Record<string, any>
): Promise<ApiResponse<T>> {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN

  const response = await fetch(baseUrl + url + queryString)
  return handleResponse(response)
}

export async function apiPost<T = any>(
  url: string,
  body: any
): Promise<ApiResponse<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN

  const response = await fetch(baseUrl + url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return handleResponse(response)
}

export async function apiPut<T = any>(
  url: string,
  body: any
): Promise<ApiResponse<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN

  const response = await fetch(baseUrl + url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return handleResponse(response)
}

export async function apiDelete<T = any>(url: string): Promise<ApiResponse<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN

  const response = await fetch(baseUrl + url, {
    method: 'DELETE',
  })
  return handleResponse(response)
}

// User API
export const userApi = {
  list: () => apiGet('/api/user/list'),
  get: (id: string) => apiGet(`/api/user/${id}/get`),
  create: (body: any) => apiPost('/api/user/create', body),
  update: (id: string, body: any) => apiPost(`/api/user/${id}/update`, body),
  delete: (id: string) => apiPost(`/api/user/${id}/delete`, {}),
}

// Auth API
export const authApi = {
  checkToken: () => apiPost('/api/auth/jwt', {}),
  createTicket: (type: 'service' | 'node') =>
    apiPost('/api/auth/ticket', { type }),
  getCookies: () => apiGet('/api/auth/getCookies'),
  getPermissions: () => apiGet<string[]>('/api/auth/getPermissions'),
}

// Player API
export const playerApi = {
  sendMessage: (id: string, message: string) =>
    apiPost(`/api/player/${id}/message`, { message }),
  kick: (id: string, message: string) =>
    apiPost(`/api/player/${id}/kick`, { message }),
  execute: (id: string, command: string, isProxy: boolean) =>
    apiPost(`/api/player/${id}/command`, { command, isProxy }),
  sendTaskGroup: (
    id: string,
    target: string,
    serverSelector: ServerSelector,
    type: Type
  ) =>
    apiPost(`/api/player/${id}/connect`, {
      target,
      serverSelector,
      type,
    }),
  sendFallback: (id: string) =>
    apiPost(`/api/player/${id}/connectFallback`, {}),
  sendService: (id: string, target: string) =>
    apiPost(`/api/player/${id}/connectService`, { target }),
  online: (params?: {
    limit?: number
    offset?: number
    sort?: 'asc' | 'desc'
  }) => apiGet('/api/player/online', params),
  onlineAmount: () => apiGet('/api/player/online/amount'),
}

// Module API
export const moduleApi = {
  getAll: () => apiGet('/api/module/loaded'),
  getAvailable: () => apiGet('/api/module/available'),
  getInfo: (id: string) => apiGet(`/api/module/${id}`),
  getConfig: (id: string) => apiGet(`/api/module/${id}/config`),
  present: () => apiGet('/api/module/present'),
  updateLifecycle: (id: string, body: any) =>
    apiPost(`/api/module/${id}/lifecycle`, body),
  updateConfig: (id: string, body: any) =>
    apiPost(`/api/module/${id}/update`, body),
  uninstall: (id: string) => apiPost(`/api/module/${id}/uninstall`, {}),
  reload: () => apiPost(`/api/module/reload`, {}),
}

// Task API
export const taskApi = {
  list: () => apiGet<{ tasks: TasksType }>('/api/task/list'),
  get: (id: string) => apiGet<{ task: Task }>(`/api/task/${id}/get`),
  update: (body: any) => apiPost('/api/task/update', body),
  delete: (id: string) => apiPost(`/api/task/${id}/delete`, {}),
}

// Group API
export const groupApi = {
  list: () => apiGet('/api/group/list'),
  get: (id: string) => apiGet(`/api/group/${id}/get`),
  update: (body: any) => apiPost(`/api/group/update`, body),
  delete: (id: string) => apiPost(`/api/group/${id}/delete`, {}),
}

// Service API
export const serviceApi = {
  list: () => apiGet<Service[]>('/api/service/list'),
  get: (id: string) => apiGet<Service>(`/api/service/${id}/get`),
  logLines: (id: string) =>
    apiGet<ServiceLogCache>(`/api/service/${id}/logLines`),
  delete: (id: string) => apiPost(`/api/service/${id}/delete`, {}),
  execute: (id: string, command: string) =>
    apiPost(`/api/service/${id}/command`, { command }),
}

// Node API
export const nodeApi = {
  list: () => apiGet('/api/node/list'),
  get: (id: string) => apiGet(`/api/node/${id}/get`),
  update: (id: string, ip: string, port: string) =>
    apiPost(`/api/node/${id}/update`, { ip, port }),
}
