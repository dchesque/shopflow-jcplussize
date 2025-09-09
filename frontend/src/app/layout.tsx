import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata = {
  title: 'ShopFlow - Smart Analytics',
  description: 'Sistema inteligente de contagem e análise de pessoas na loja',
  keywords: 'analytics, retail, people counting, AI, computer vision',
  authors: [{ name: 'ShopFlow Team' }],
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
    <html lang="pt-BR" className="dark">
      <body 
        className={cn(
          'min-h-screen bg-neutral-950 antialiased',
          inter.variable
        )}
      >
        {/* Background gradients */}
        <div className="fixed inset-0 bg-gradient-to-br from-red-500/5 via-neutral-950 to-purple-500/5" />
        
        {/* Grid pattern */}
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        
        {/* Main content */}
        <div className="relative">
          <QueryProvider>
            <ThemeProvider>
              {children}
              <Toaster
                position="top-right"
                theme="dark"
                richColors
                closeButton
              />
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