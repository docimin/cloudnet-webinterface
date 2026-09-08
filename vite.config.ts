import { sentryTanstackStart } from '@sentry/tanstackstart-react/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block'
}

export default defineConfig({
  resolve: { tsconfigPaths: true },
  server: { headers: securityHeaders },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    sentryTanstackStart({
      tunnelRoute: '/api/monitoring',
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      sentryUrl: process.env.SENTRY_URL,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: !process.env.CI,
      // Leading-dot dirs need naming explicitly; a bare **/*.map matches nothing
      // here and silently ships every source map to the public asset dir.
      sourcemaps: {
        filesToDeleteAfterUpload: ['./.output/**/*.map', './dist/**/*.map']
      }
    }),
    nitro({ routeRules: { '**': { headers: securityHeaders } } }),
    viteReact()
  ]
})
