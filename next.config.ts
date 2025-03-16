/** @type {import('next').NextConfig} */
import { withGTConfig } from 'gt-next/config'

import { SentryBuildOptions, withSentryConfig } from '@sentry/nextjs'
import { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: false,
  // output: 'standalone', // This is needed if you want to use docker
  compiler: {
    styledComponents: true,
    //removeConsole: {
    //  exclude: ['error'],
    //},
  },
  devIndicators: {
    position: 'bottom-right',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

// Injected content via Sentry wizard below

const sentryOptions: SentryBuildOptions = {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  silent: !process.env.CI,
  org: 'CloudNet',
  project: 'cloudnet-webinterface',
  sentryUrl: 'https://sentry.fayevr.dev',

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers. (increases server load)
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of
  // client-side errors will fail.
  tunnelRoute: '/api/monitoring',

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors.
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: false,
}

const sentryNextConfig = withSentryConfig(nextConfig, sentryOptions)

export default withGTConfig(sentryNextConfig, {
  defaultLocale: 'en',
  locales: ['nl', 'de', 'en'],
  runtimeUrl: null,
  loadDictionaryPath: './src/loadDictionary.ts',
})
