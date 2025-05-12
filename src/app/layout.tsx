import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'AI Business Directory - Find Local Businesses',
    template: '%s | AI Business Directory',
  },
  description: 'Discover local businesses with AI-powered assistance. Each business listing includes an AI agent to help answer your questions.',
  keywords: ['business directory', 'AI assistant', 'local businesses', 'find businesses'],
  authors: [{ name: 'AI Business Directory Team' }],
  creator: 'AI Business Directory',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'AI Business Directory',
    description: 'Discover local businesses with AI-powered assistance',
    siteName: 'AI Business Directory',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Business Directory',
    description: 'Discover local businesses with AI-powered assistance',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}