import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: 'https://57e2b1cf8b3d87e84733b51c2c80f5cf@sentry.fayevr.dev/9',
      tracesSampleRate: 1.0,
      debug: false,
    })
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: 'https://57e2b1cf8b3d87e84733b51c2c80f5cf@sentry.fayevr.dev/9',
      tracesSampleRate: 1.0,
      debug: false,
    })
  }
}
