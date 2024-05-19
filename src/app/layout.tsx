import '../../css/globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from './providers'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata() {
  return {
    title: {
      default: process.env.NEXT_PUBLIC_NAME,
      template: `%s - ERP`,
    },
    description: 'ERP System for Business Management',
    keywords: [
      process.env.NEXT_PUBLIC_NAME,
      'erp',
      'systems',
      'management',
      'software',
      'business',
      'enterprise',
      'resource',
      'planning',
      'solution',
      'cloud',
      'service',
      'industry',
      'manufacturing',
      'retail',
      'wholesale',
      'distribution',
      'logistics',
      'supply',
      'chain',
      'finance',
      'accounting',
      'human',
      'capital',
      'management',
      'customer',
      'relationship',
      'sales',
      'marketing',
      'service',
      'project',
      'inventory',
      'warehouse',
      'production',
      'quality',
      'control',
      'maintenance',
      'repair',
      'field',
      'service',
      'asset',
      'fleet',
      'management',
      'document',
      'workflow',
      'collaboration',
      'business',
      'intelligence',
      'analytics',
      'reporting',
      'dashboard',
      'automation',
      'integration',
      'customization',
      'scalability',
      'security',
      'privacy',
      'compliance',
      'regulation',
      'audit',
      'risk',
      'governance',
      'strategy',
      'trend',
      'innovation',
      'technology',
    ],
    icons: {
      icon: '/logos/logo.svg',
    },
    openGraph: {
      title: 'Beyond ERP',
      description: 'ERP System for Business Management',
      siteName: process.env.NEXT_PUBLIC_NAME,
      images: '/logos/logo.svg',
      type: 'website',
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_DOMAIN_CLOUD),
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
          <div className="w-full">{children}</div>
        </ThemeProvider>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  )
}
