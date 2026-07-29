import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import {
  GTProvider,
  getLocale,
  getTranslations,
  getTranslationsSnapshot
} from 'gt-tanstack-start'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import ErrorScreen from '@/components/static/errorScreen'
import Loading from '@/components/static/loading'
import NotFound from '@/components/static/notFound'
import appCss from '../../css/globals.css?url'
import { loadDictionary } from '../gt'

const name = import.meta.env.VITE_NAME || 'CloudNet'

export const Route = createRootRoute({
  loader: async () => {
    const locale = getLocale()
    const [translations, dictionary] = await Promise.all([
      getTranslationsSnapshot(locale),
      loadDictionary(locale)
    ])
    return { locale, translations, dictionaries: { [locale]: dictionary } }
  },
  head: async () => {
    const t = await getTranslations('Meta')
    const title = t('title', { name })
    const description = t('description', { name })

    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { title },
        { name: 'description', content: description },
        { name: 'keywords', content: t('keywords') },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:site_name', content: title },
        { property: 'og:type', content: 'website' }
      ],
      links: [
        { rel: 'stylesheet', href: appCss },
        {
          rel: 'icon',
          href: import.meta.env.VITE_LOGO_PATH || '/logos/logo.svg'
        }
      ]
    }
  },
  shellComponent: RootDocument,
  errorComponent: ErrorScreen,
  notFoundComponent: NotFound,
  pendingComponent: Loading
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { locale, translations, dictionaries } = Route.useLoaderData()

  return (
    <html lang={locale} className="h-full" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-screen font-sans antialiased bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GTProvider
            locale={locale}
            translations={translations}
            dictionaries={dictionaries}
          >
            <div className="w-full h-full">{children}</div>
          </GTProvider>
        </ThemeProvider>
        <Toaster
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                'p-4 rounded-md w-fit min-w-90 max-w-105 flex items-center gap-3 relative text-sm',
              error:
                'border border-destructive text-destructive-foreground bg-gradient-to-r from-destructive via-black to-black items-center',
              success:
                'border border-success dark:text-foreground text-background bg-gradient-to-r from-success via-black to-black items-center',
              loading:
                'border dark:border-muted dark:text-foreground text-background bg-gradient-to-r from-loading via-black to-black items-center',
              info: 'border dark:border-muted dark:text-foreground text-background bg-gradient-to-r from-loading via-black to-black items-center'
            }
          }}
          icons={{
            error: <AlertCircle className="size-4" />,
            success: <CheckCircle className="size-4" />,
            loading: <Loader2 className="size-4 animate-spin" />
          }}
        />
        <Scripts />
      </body>
    </html>
  )
}
