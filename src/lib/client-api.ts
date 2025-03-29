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

export async function apiGet<T = any>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url)
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
    apiPost(`/api/player/online/${id}/message`, { message }),
  kick: (id: string, message: string) =>
    apiPost(`/api/player/online/${id}/kick`, { message }),
}

// Module API
export const moduleApi = {
  get: (id: string) => apiGet(`/api/module/${id}/get`),
  updateConfig: (id: string, body: any) =>
    apiPost(`/api/module/${id}/update`, body),
  uninstall: (id: string) => apiPost(`/api/module/${id}/uninstall`, {}),
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
  create: (body: any) => apiPost('/api/group/create', body),
  update: (id: string, body: any) => apiPost(`/api/group/${id}/update`, body),
  delete: (id: string) => apiPost(`/api/group/${id}/delete`, {}),
}

// Service API
export const serviceApi = {
  list: () => apiGet('/api/service/list'),
  get: (id: string) => apiGet(`/api/service/${id}/get`),
  delete: (id: string) => apiPost(`/api/service/${id}/delete`, {}),
}

// Command API
export const commandApi = {
  execute: (path: string, command: string) =>
    apiPost('/api/command/execute', { path, command }),
}

// Node API
export const nodeApi = {
  list: () => apiGet('/api/node/list'),
  get: (id: string) => apiGet(`/api/node/${id}/get`),
  update: (id: string, ip: string, port: string) =>
    apiPost(`/api/node/${id}/update`, { ip, port }),
}
