import {
  sentryGlobalFunctionMiddleware,
  sentryGlobalRequestMiddleware
} from '@sentry/tanstackstart-react'
import { createCsrfMiddleware, createStart } from '@tanstack/react-start'
import './gt'

const csrfMiddleware = createCsrfMiddleware({
  filter: ({ handlerType }) => handlerType === 'serverFn'
})

// gt-tanstack-start's browser build has no gtMiddleware and this module is
// bundled into both graphs, so it can only be pulled in behind an SSR guard.
export const startInstance = createStart(async () => ({
  requestMiddleware: [
    sentryGlobalRequestMiddleware,
    csrfMiddleware,
    ...(import.meta.env.SSR
      ? [(await import('gt-tanstack-start')).gtMiddleware]
      : [])
  ],
  functionMiddleware: [sentryGlobalFunctionMiddleware]
}))
