import {
  deleteCookie,
  getCookie,
  setCookie
} from '@tanstack/react-start/server'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const AUTH_COOKIES = ['add', 'at', 'rt', 'permissions'] as const

export function isSecure() {
  const domain = process.env.VITE_DOMAIN
  if (!domain) throw new Error('VITE_DOMAIN is not set')
  return new URL(domain).protocol === 'https:'
}

export function setAuthCookie(name: string, value: string, maxAge: number) {
  setCookie(name, value, {
    httpOnly: true,
    secure: isSecure(),
    sameSite: 'strict',
    maxAge,
    path: '/'
  })
}

export function clearAuthCookies() {
  for (const name of AUTH_COOKIES) {
    deleteCookie(name, { path: '/' })
  }
}

export function getAddress() {
  const address = getCookie('add')
  if (!address) throw new ApiError(401, 'Unauthorized')
  return decodeURIComponent(address)
}

export function getPermissions(): string[] {
  const raw = getCookie('permissions')
  if (!raw) return []
  try {
    // the cookie holds the node's `scopes` verbatim; a non-array there would
    // otherwise reach `permissions.includes` in every route loader
    const parsed: unknown = JSON.parse(decodeURIComponent(raw))
    if (!Array.isArray(parsed)) return []
    return parsed.filter((scope): scope is string => typeof scope === 'string')
  } catch {
    return []
  }
}

export function requirePermissions(required: string[]) {
  const permissions = getPermissions()
  if (!required.some((permission) => permissions.includes(permission))) {
    throw new ApiError(401, 'Unauthorized')
  }
}

export type FetchOptions = {
  rawBody?: boolean
  contentType?: string
  response?: 'json' | 'text' | 'binary'
}

export async function cloudnetFetch<T>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: unknown,
  options?: FetchOptions
): Promise<T> {
  const accessToken = getCookie('at')
  const address = getAddress()
  if (!accessToken) throw new ApiError(401, 'Unauthorized')

  const response = await fetch(`${address}${path}`, {
    method,
    headers: {
      'Content-Type': options?.contentType ?? 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    ...(body === undefined
      ? {}
      : { body: options?.rawBody ? (body as BodyInit) : JSON.stringify(body) })
  })

  if (options?.response === 'binary') {
    const buffer = await response.arrayBuffer()
    if (!response.ok) throw new ApiError(response.status, response.statusText)
    return buffer as T
  }

  const text = await response.text()

  // ahead of the empty-body check: an empty file must read back as '', not true
  if (options?.response === 'text') {
    if (!response.ok) throw new ApiError(response.status, response.statusText)
    return text as T
  }

  if (!text) {
    if (!response.ok) throw new ApiError(response.status, response.statusText)
    // 201/204 with no body is a success; `undefined` reads as failure to callers
    return true as T
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    if (!response.ok) throw new ApiError(response.status, response.statusText)
    return text as T
  }

  if (!response.ok) {
    // RFC 9457 says `detail` is a string, but the spec marks nothing required
    const detail = (parsed as { detail?: unknown } | null)?.detail
    throw new ApiError(
      response.status,
      typeof detail === 'string' && detail ? detail : response.statusText
    )
  }

  // No 0.5.1 endpoint wraps its payload in `data`; unwrapping blindly truncated
  // any response that legitimately carried a top-level `data` key.
  return parsed as T
}

export function query(params: Record<string, unknown>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value))
      for (const v of value) search.append(key, String(v))
    else search.set(key, String(value))
  }
  const string = search.toString()
  return string ? `?${string}` : ''
}
