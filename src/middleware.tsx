import createMiddleware from 'next-intl/middleware'
import { locales, pathnames } from './navigation'

export default createMiddleware({
  localePrefix: 'always',
  defaultLocale: 'en',
  locales,
  pathnames,
})

export const config = {
  // Match only internationalized pathnames
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|apple-touch-icon.png|favicon.svg|images/books|icons|manifest).*)',
  ],
}
