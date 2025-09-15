import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { DetectionProvider } from '@/contexts/DetectionContext'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata = {
  title: {
    default: 'ShopFlow - Smart Analytics',
    template: '%s | ShopFlow'
  },
  description: 'Sistema inteligente de contagem e análise de pessoas na loja. Monitore fluxo de clientes, analise comportamento e otimize seu negócio com IA.',
  keywords: ['analytics', 'retail', 'people counting', 'AI', 'computer vision', 'business intelligence', 'loja inteligente', 'análise comportamental'],
  authors: [{ name: 'ShopFlow Team' }],
  creator: 'ShopFlow',
  publisher: 'ShopFlow',
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
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://shopflow.com',
    siteName: 'ShopFlow',
    title: 'ShopFlow - Smart Analytics',
    description: 'Sistema inteligente de análise de pessoas na loja com IA',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ShopFlow Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shopflow',
    creator: '@shopflow',
    title: 'ShopFlow - Smart Analytics',
    description: 'Sistema inteligente de análise de pessoas na loja com IA',
    images: ['/og-image.png'],
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress common development warnings and errors
              if (typeof window !== 'undefined') {
                const originalError = console.error;
                const originalWarn = console.warn;
                
                console.error = (...args) => {
                  const message = args[0]?.toString?.() || '';
                  if (message.includes('Hydration failed') || 
                      message.includes('hydrated but some attributes') ||
                      message.includes('Maximum update depth exceeded') ||
                      message.includes('WebSocket connection') ||
                      message.includes('Connection error')) {
                    return;
                  }
                  originalError.apply(console, args);
                };
                
                console.warn = (...args) => {
                  const message = args[0]?.toString?.() || '';
                  if (message.includes('React DevTools') ||
                      message.includes('scroll-behavior') ||
                      message.includes('pré-carregado')) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
              }
            `,
          }}
        />
      </head>
      <body 
        className={cn(
          'min-h-screen bg-neutral-950 antialiased',
          inter.variable
        )}
        suppressHydrationWarning
      >
        {/* Background gradients */}
        <div className="fixed inset-0 bg-gradient-to-br from-red-500/5 via-neutral-950 to-purple-500/5" />
        
        {/* Grid pattern */}
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        
        {/* Main content */}
        <div className="relative">
          <QueryProvider>
            <ThemeProvider>
              <DetectionProvider>
                {children}
                <Toaster
                  position="top-right"
                  theme="dark"
                  richColors
                  closeButton
                />
              </DetectionProvider>
            </ThemeProvider>
          </QueryProvider>
          
          {/* Analytics */}
          {process.env.NODE_ENV === 'production' && (
            <>
              <Analytics />
              <SpeedInsights />
            </>
          )}
        </div>
      </body>
    </html>
  )
}