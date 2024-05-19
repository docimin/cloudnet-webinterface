import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://57e2b1cf8b3d87e84733b51c2c80f5cf@sentry.fayevr.dev/9',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
})
