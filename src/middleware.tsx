import createMiddleware from 'next-intl/middleware'
import { locales, pathnames } from './navigation'

export default createMiddleware({
  localePrefix: 'always',
  defaultLocale: 'en',
  locales,
  pathnames,
})

export const config = {
  // Skip all paths that should not be internationalized. This example skips
  // certain folders and all pathnames with a dot (e.g. favicon.ico)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
