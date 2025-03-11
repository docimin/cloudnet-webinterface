// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://29029dadcf0f021c23dd20f0e0bd3ff7@sentry.fayevr.dev/2',
  enabled: process.env.NODE_ENV !== 'development',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // enable Spotlight (https://spotlightjs.com)
  spotlight: process.env.NODE_ENV === 'development',
})
