import '../../css/globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { GTProvider } from 'gt-next/server'
const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata() {
  return {
    title: {
      default: `${process.env.NEXT_PUBLIC_NAME || 'CloudNet'} Webinterface`,
      template: `%s - ${process.env.NEXT_PUBLIC_NAME || 'CloudNet'}`
    },
    description: `Modern webinterface for ${process.env.NEXT_PUBLIC_NAME || 'CloudNet'} v4`,
    keywords: ['cloudnet', 'minecraft', 'webinterface'],
    icons: {
      icon: process.env.NEXT_PUBLIC_LOGO_PATH || '/logos/logo.svg'
    },
    openGraph: {
      title: `${process.env.NEXT_PUBLIC_NAME || 'CloudNet'} Webinterface`,
      description: `Modern webinterface for ${process.env.NEXT_PUBLIC_NAME || 'CloudNet'} v4`,
      siteName: `${process.env.NEXT_PUBLIC_NAME || 'CloudNet'} Webinterface`,
      type: 'website'
    }
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
          <GTProvider>
            <div className="w-full h-full">{children}</div>
          </GTProvider>
        </ThemeProvider>
        <Toaster
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                'p-4 rounded-md w-fit min-w-[360px] max-w-[420px] flex items-center gap-3 relative text-sm',
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
      </body>
    </html>
  )
}
