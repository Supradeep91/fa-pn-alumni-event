import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FA PN Connect',
  description: 'Play. Connect. Leave a Legacy.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'FA PN Connect' },
  openGraph: {
    title: 'FA PN Connect',
    description: 'Play. Connect. Leave a Legacy.',
    siteName: 'FA PN Connect',
  },
  twitter: {
    title: 'FA PN Connect',
    description: 'Play. Connect. Leave a Legacy.',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a7ea4',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-slate-950 text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
