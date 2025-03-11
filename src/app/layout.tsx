import '../../css/globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import ContextMenuProvider from '@/components/system/contextMenu'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata() {
  return {
    title: {
      default: 'CloudNet Webinterface',
      template: `%s - CloudNet`,
    },
    description: 'Modern webinterface for CloudNet v4',
    keywords: ['cloudnet', 'minecraft', 'webinterface'],
    icons: {
      icon: '/logos/logo.svg',
    },
    openGraph: {
      title: 'CloudNet Webinterface',
      description: 'Modern webinterface for CloudNet v4',
      siteName: 'CloudNet Webinterface',
      type: 'website',
    },
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${inter.className} flex min-h-screen antialiased bg-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ContextMenuProvider>
            <div className="w-full h-full">{children}</div>
          </ContextMenuProvider>
        </ThemeProvider>
        <Toaster
          toastOptions={{
            classNames: {
              error: [
                'border border-destructive text-destructive-foreground',
                'bg-gradient-to-r from-destructive via-black to-black',
              ].join(' '),
              success: [
                'border border-success dark:text-foreground text-background',
                'bg-gradient-to-r from-success via-black to-black',
              ].join(' '),
              loading: [
                'border dark:border-muted dark:text-foreground text-background',
                'bg-gradient-to-r from-muted via-black to-black',
              ].join(' '),
            },
          }}
        />
      </body>
    </html>
  )
}
