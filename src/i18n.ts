import { getRequestConfig } from 'next-intl/server'
import { IntlErrorCode } from 'next-intl'
import { notFound } from 'next/navigation'
import { locales } from '@/navigation'

// Can be imported from a shared config

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound()

  return {
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        },
      },
      number: {
        precise: {
          maximumFractionDigits: 5,
        },
      },
      list: {
        enumeration: {
          style: 'long',
          type: 'conjunction',
        },
      },
    },
    async onError(error) {
      if (error.code === IntlErrorCode.MISSING_MESSAGE) {
        // Missing translations are expected and should only log an error
        console.error(error)
      } else {
        // Log all other errors to the admin database
        // TODO: Implement this
      }
    },
    getMessageFallback({ namespace, key, error }) {
      const path = [namespace, key].filter((part) => part != null).join('.')

      if (error.code === IntlErrorCode.MISSING_MESSAGE) {
        return path + ' is not yet translated'
      } else {
        return 'Dear developer, please fix this message: ' + path
      }
    },
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
