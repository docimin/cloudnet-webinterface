import { createServerFn } from '@tanstack/react-start'
import {
  deleteCookie,
  getCookie,
  setCookie
} from '@tanstack/react-start/server'
import {
  accentStylesheet,
  isHex,
  overridesSchema,
  parseHostDefaults,
  parseOverrides,
  resolveAppearance
} from '@/lib/appearance'
import { isSecure } from './cloudnet'

const COOKIE = 'appearance'
const ONE_YEAR = 60 * 60 * 24 * 365

export const getAppearance = createServerFn({ method: 'GET' }).handler(
  async () => {
    const host = parseHostDefaults(process.env)
    const user = parseOverrides(getCookie(COOKIE))
    const resolved = resolveAppearance(host, user)
    return {
      host,
      user,
      resolved,
      accentCss: isHex(resolved.accent) ? accentStylesheet(resolved.accent) : ''
    }
  }
)

export const setAppearance = createServerFn({ method: 'POST' })
  .validator(overridesSchema)
  .handler(async ({ data }) => {
    setCookie(COOKIE, JSON.stringify(data), {
      httpOnly: true,
      secure: isSecure(),
      // Lax so a link from elsewhere still renders in the person's own theme
      sameSite: 'lax',
      maxAge: ONE_YEAR,
      path: '/'
    })
    return true
  })

export const resetAppearance = createServerFn({ method: 'POST' }).handler(
  async () => {
    deleteCookie(COOKIE, { path: '/' })
    return true
  }
)
