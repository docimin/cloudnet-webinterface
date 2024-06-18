import '../../css/globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from './providers'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import ContextMenuProvider from '@/components/system/contextMenu'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata() {
  return {
    title: {
      default: 'CloudNet Webinterface',
      template: `%s - ERP`,
    },
    description: 'Modern webinterface for CloudNet v4',
    keywords: [
      process.env.NEXT_PUBLIC_NAME,
      'cloudnet',
      'minecraft',
      'webinterface',
    ],
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
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  )
}
