import * as Sentry from '@sentry/tanstackstart-react'

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 1,
  debug: false,
  spotlight: process.env.SENTRY_SPOTLIGHT !== 'false'
})
