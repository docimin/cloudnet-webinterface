import net from 'node:net'
import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { z } from 'zod'
import {
  clearAuthCookies,
  cloudnetFetch,
  getAddress,
  getPermissions,
  requirePermissions,
  setAuthCookie
} from './cloudnet'
import { toUser } from './user'

const blockedIPv4 = (host: string): boolean => {
  const octets = host.split('.').map(Number)
  return (
    // 0.0.0.0/8 "this network"
    octets[0] === 0 ||
    // 10.0.0.0/8
    octets[0] === 10 ||
    // 127.0.0.0/8 loopback
    octets[0] === 127 ||
    // 172.16.0.0/12
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    // 192.168.0.0/16
    (octets[0] === 192 && octets[1] === 168) ||
    // 169.254.0.0/16 link-local, how cloud metadata endpoints are reached
    (octets[0] === 169 && octets[1] === 254)
  )
}

// net.isIP has already validated the literal, so this only has to expand it
const ipv6Groups = (host: string): number[] | null => {
  let text = host.toLowerCase()

  // a trailing dotted quad (::ffff:127.0.0.1) is two groups written in decimal
  const dotted = text.match(/\d{1,3}(?:\.\d{1,3}){3}$/)
  if (dotted) {
    const o = dotted[0].split('.').map(Number)
    const hex = (high: number, low: number) => ((high << 8) | low).toString(16)
    text = `${text.slice(0, -dotted[0].length)}${hex(o[0], o[1])}:${hex(o[2], o[3])}`
  }

  const [head, tail] = text.split('::')
  const split = (part: string) => (part === '' ? [] : part.split(':'))
  const groups =
    tail === undefined
      ? split(head)
      : [
          ...split(head),
          ...Array(8 - split(head).length - split(tail).length).fill('0'),
          ...split(tail)
        ]

  if (groups.length !== 8) return null
  return groups.map((group) => Number.parseInt(group, 16))
}

const blockedIPv6 = (host: string): boolean => {
  const groups = ipv6Groups(host)
  if (!groups) return false

  // ::ffff:a.b.c.d (mapped) and ::a.b.c.d (compatible) wrap an IPv4 address;
  // ::1 and :: fall out of this as 0.0.0.1 and 0.0.0.0
  if (
    groups.slice(0, 5).every((group) => group === 0) &&
    (groups[5] === 0xffff || groups[5] === 0)
  ) {
    return blockedIPv4(
      [groups[6] >> 8, groups[6] & 0xff, groups[7] >> 8, groups[7] & 0xff].join(
        '.'
      )
    )
  }

  // fc00::/7 unique local, fe80::/10 link-local
  return (groups[0] & 0xfe00) === 0xfc00 || (groups[0] & 0xffc0) === 0xfe80
}

const blockedHost = (host: string): boolean => {
  // URL.hostname keeps IPv6 literals bracketed and net.isIP rejects those
  const bare =
    host.startsWith('[') && host.endsWith(']') ? host.slice(1, -1) : host

  const version = net.isIP(bare)
  if (version === 4) return blockedIPv4(bare)
  if (version === 6) return blockedIPv6(bare)
  // RFC 6761: localhost and anything under it always resolves to loopback
  return bare === 'localhost' || bare.endsWith('.localhost')
}

const normalizeAndValidateAddress = (rawAddress: string): string => {
  if (typeof rawAddress !== 'string' || rawAddress.trim() === '') {
    throw new Error('Invalid address')
  }

  let addr = rawAddress.trim()

  // Ensure a scheme is present so URL parsing is reliable
  // IP addresses default to http (CloudNet REST API), domains to https
  if (!addr.startsWith('http://') && !addr.startsWith('https://')) {
    const hostPart = addr.split('/')[0].split(':')[0]
    addr = net.isIP(hostPart) ? `http://${addr}` : `https://${addr}`
  }

  let url: URL
  try {
    url = new URL(addr)
  } catch {
    throw new Error('Invalid address')
  }

  // Only allow http/https
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Invalid address protocol')
  }

  // Off by default: self-hosted CloudNet usually runs on loopback/LAN.
  // Enable on public/multi-tenant instances to mitigate SSRF.
  if (
    process.env.BLOCK_PRIVATE_ADDRESSES === 'true' &&
    blockedHost(url.hostname)
  ) {
    throw new Error('Address not allowed')
  }

  // Ensure path ends with /api/v3
  if (!url.pathname.endsWith('/api/v3')) {
    // Trim any trailing slash then append /api/v3
    const basePath = url.pathname.replace(/\/+$/, '')
    url.pathname = `${basePath}/api/v3`
  }

  // Clear hash to avoid confusing downstream logic
  url.hash = ''

  return url.toString().replace(/\/+$/, '')
}

export const signin = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      address: z.string(),
      username: z.string(),
      password: z.string()
    })
  )
  .handler(async ({ data }) => {
    const { address, username, password } = data

    let validatedAddress: string
    try {
      validatedAddress = normalizeAndValidateAddress(address)
    } catch {
      return { error: 'Incorrect address!', status: 400 }
    }

    try {
      const basicAuth = Buffer.from(`${username}:${password}`).toString(
        'base64'
      )
      const response = await fetch(`${validatedAddress}/auth`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/json'
        }
      })

      const dataResponse = await response.json()

      if (dataResponse.name === 'SyntaxError') {
        return { error: 'Invalid response', status: 404 }
      }

      if (dataResponse.status === 401) {
        return { error: 'Invalid credentials', status: 401 }
      }

      const expirationAccessTime = Number(
        new Date(Date.now() + dataResponse.accessToken.expiresIn)
      )
      const expirationRefreshTime = Number(
        new Date(Date.now() + dataResponse.refreshToken.expiresIn)
      )

      setAuthCookie(
        'add',
        validatedAddress,
        dataResponse.refreshToken.expiresIn
      )
      setAuthCookie('at', dataResponse.accessToken.token, expirationAccessTime)
      setAuthCookie(
        'rt',
        dataResponse.refreshToken.token,
        expirationRefreshTime
      )
      setAuthCookie(
        'permissions',
        JSON.stringify(dataResponse.scopes),
        expirationAccessTime
      )

      // The tokens are already in httpOnly cookies; echoing the raw payload
      // would put both bearer tokens in the browser too. The client only tests
      // for success and reads `cause`/`status` on failure.
      return { ok: true, cause: dataResponse.cause, status: 200 }
    } catch (error) {
      if (error.message === 'fetch failed') {
        return { error: 'Incorrect address!', status: 404 }
      }
      return { error: error.message || 'Internal server error' }
    }
  })

export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  const rawAddress = getCookie('add')
  // /auth/revoke drops the access token and its refresh token, whichever of the
  // two it is called with
  const token = getCookie('rt') ?? getCookie('at')

  if (rawAddress && token) {
    // an unreachable or hanging node must never leave the user stuck logged in
    await fetch(`${decodeURIComponent(rawAddress)}/auth/revoke`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000)
    }).catch(() => undefined)
  }

  clearAuthCookies()
  return { status: 204 }
})

export const jwt = createServerFn({ method: 'POST' }).handler(async () => {
  const refreshToken = getCookie('rt')
  const rawAddress = getCookie('add')

  if (!refreshToken || !rawAddress) {
    clearAuthCookies()
    return { status: 401, error: 'Unauthorized' }
  }

  const address = decodeURIComponent(rawAddress)

  const setCookie = (name: string, value: string, expiresIn: number) =>
    setAuthCookie(name, value, Number(new Date(Date.now() + expiresIn)))

  try {
    const accessResponse = await fetch(`${address}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getCookie('at')}`
      }
    })

    if (accessResponse.status === 200) {
      return { status: 200 }
    }

    if (accessResponse.status !== 401) {
      return { status: accessResponse.status, error: 'Authentication failed' }
    }

    const refreshResponse = await fetch(`${address}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`
      }
    })

    if (refreshResponse.status === 401) {
      clearAuthCookies()
      return { status: 401, error: 'Unauthorized' }
    }

    const responseRefresh = await fetch(`${address}/auth/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        'Content-Type': 'application/json'
      }
    })

    const dataResponse = await responseRefresh.json()

    const expirationAccessTime = Number(
      new Date(Date.now() + dataResponse.accessToken.expiresIn)
    )
    const expirationRefreshTime = Number(
      new Date(Date.now() + dataResponse.refreshToken.expiresIn)
    )

    setCookie('add', address, dataResponse.refreshToken.expiresIn)
    setCookie('at', dataResponse.accessToken.token, expirationAccessTime)
    setCookie('rt', dataResponse.refreshToken.token, expirationRefreshTime)
    setCookie(
      'permissions',
      JSON.stringify(dataResponse.scopes),
      expirationAccessTime
    )

    return { status: 200 }
  } catch {
    clearAuthCookies()
    return { status: 401, error: 'Unauthorized' }
  }
})

export const ticket = createServerFn({ method: 'POST' })
  .validator(z.object({ type: z.enum(['node', 'service']) }))
  .handler(async ({ data }) => {
    const scopes =
      data.type === 'node'
        ? ['cloudnet_rest:node_live_console']
        : ['cloudnet_rest:service_live_log']

    const payload = await cloudnetFetch<unknown>('/auth/ticket', 'POST', {
      scopes
    })
    // AuthTicket marks nothing required; the console rejects an empty ticket
    // rather than opening a socket with `?ticket=undefined`
    const secret = (payload as { secret?: unknown } | null)?.secret
    return { secret: typeof secret === 'string' ? secret : '' }
  })

// Returns only the node address. Returning the whole cookie jar would hand the
// httpOnly `at`/`rt` tokens to browser JS and undo the reason they are httpOnly.
export const currentAddress = createServerFn({ method: 'GET' }).handler(
  async () => ({ address: getAddress() })
)

export const currentPermissions = createServerFn({ method: 'GET' }).handler(
  async (): Promise<string[]> => getPermissions()
)

export const authGetUser = createServerFn({ method: 'GET' })
  .validator(z.object({ userId: z.string().min(1) }))
  .handler(async ({ data }) => {
    requirePermissions([
      'cloudnet_rest:user_read',
      'cloudnet_rest:user_get',
      'global:admin'
    ])
    const payload = await cloudnetFetch<unknown>(
      `/user/${encodeURIComponent(data.userId)}`
    )
    return toUser(payload, data.userId)
  })

export const verifyAuth = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ status?: number }> => {
    const refreshToken = getCookie('rt')
    const rawAddress = getCookie('add')

    if (!refreshToken || !rawAddress) {
      return { status: 401 }
    }

    try {
      const response = await fetch(
        `${decodeURIComponent(rawAddress)}/auth/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getCookie('at')}`
          }
        }
      )

      return await response.json()
    } catch {
      // original returned the raw error object; callers only read `.status`,
      // so a network failure must not read as 401 and log the user out
      return {}
    }
  }
)
