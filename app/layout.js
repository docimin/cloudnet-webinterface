import './globals.css'
import { Inter } from 'next/font/google'
import Menu from '@/components/menu'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Fyfu Webinterface',
  description: 'Automatic build using Next.js and Tailwind CSS',
  url: "https://fayevr.dev",
  image: "icon-512.png",
  icon: "icon-512.png",
  keywords: [
    "faye",
    "fayevr",
    "fayevr.dev",
    "faye vr",
    "portfolio",
    "website",
    "personal",
    "personal website",
    "personal portfolio",
  ],
  theme: "#ff4f00",
}

export default function RootLayout({ children }) {
  return (
    <html className="h-full" lang="en">
      <body className="h-full">
        <Menu />
        {children}
        </body>
    </html>
  )
}
