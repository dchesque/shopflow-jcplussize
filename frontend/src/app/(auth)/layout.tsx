'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { RealtimeProvider } from '@/components/providers/RealtimeProvider'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RealtimeProvider maxReconnectAttempts={5} heartbeatInterval={30000}>
      <div className="min-h-screen bg-neutral-950">
        <Sidebar />
        <div className="flex flex-col min-h-screen pl-70 transition-all duration-300">
          <Header />
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </RealtimeProvider>
  )
}