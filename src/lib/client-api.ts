type ApiResponse<T = any> = {
  detail: string
  status: number
  title: string
  type: string
}

async function handleResponse(response: Response): Promise<ApiResponse> {
  const responseData = await response.json()

  try {
    return responseData
  } catch (error) {
    return responseData
  }
}

export async function apiGet<T = any>(
  url: string,
  params?: Record<string, any>
): Promise<ApiResponse<T>> {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
  const response = await fetch(url + queryString)
  return handleResponse(response)
}

export async function apiPost<T = any>(
  url: string,
  body: any
): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
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
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return handleResponse(response)
}

export async function apiDelete<T = any>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
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
}

// Player API
export const playerApi = {
  sendMessage: (id: string, message: string) =>
    apiPost(`/api/player/${id}/message`, { message }),
  kick: (id: string, message: string) =>
    apiPost(`/api/player/${id}/kick`, { message }),
  execute: (id: string, command: string) =>
    apiPost(`/api/player/${id}/command`, { command }),
  sendTaskGroup: (id: string, taskGroup: string) =>
    apiPost(`/api/player/${id}/connect`, { taskGroup }),
  sendFallback: (id: string) =>
    apiPost(`/api/player/${id}/connectFallback`, {}),
  sendService: (id: string, service: string) =>
    apiPost(`/api/player/${id}/connectService`, { service }),
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
    apiPost(`/api/module/${id}/config`, body),
  uninstall: (id: string) => apiPost(`/api/module/${id}/uninstall`, {}),
  reload: () => apiPost(`/api/module/reload`, {}),
}

// Task API
export const taskApi = {
  list: () => apiGet('/api/task/list'),
  get: (id: string) => apiGet(`/api/task/${id}/get`),
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
  list: () => apiGet('/api/service/list'),
  get: (id: string) => apiGet(`/api/service/${id}/get`),
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
