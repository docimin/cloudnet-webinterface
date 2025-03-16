import '../../css/globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata() {
  return {
    title: {
      default: `${process.env.NEXT_PUBLIC_NAME || 'CloudNet'} Webinterface`,
      template: `%s - ${process.env.NEXT_PUBLIC_NAME || 'CloudNet'}`,
    },
    description: `Modern webinterface for ${process.env.NEXT_PUBLIC_NAME || 'CloudNet'} v4`,
    keywords: ['cloudnet', 'minecraft', 'webinterface'],
    icons: {
      icon: process.env.NEXT_PUBLIC_LOGO_PATH || '/logos/logo.svg',
    },
    openGraph: {
      title: `${process.env.NEXT_PUBLIC_NAME || 'CloudNet'} Webinterface`,
      description: `Modern webinterface for ${process.env.NEXT_PUBLIC_NAME || 'CloudNet'} v4`,
      siteName: `${process.env.NEXT_PUBLIC_NAME || 'CloudNet'} Webinterface`,
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
          <div className="w-full h-full">{children}</div>
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
