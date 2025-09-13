import { ShoppingBag, Users, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/25">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">ShopFlow</h1>
        </div>

        {/* Hero text */}
        <h2 className="text-2xl font-semibold text-white mb-4">
          Sistema Inteligente de Analytics
        </h2>
        <p className="text-neutral-400 mb-12 text-lg leading-relaxed">
          Transforme sua loja com insights em tempo real sobre comportamento de clientes e funcionários. 
          Powered by IA e Computer Vision.
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6 text-center hover:scale-105 transition-transform">
            <Users className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Contagem em Tempo Real</h3>
            <p className="text-neutral-400 text-sm">Monitore pessoas na loja com precisão de IA</p>
          </div>
          
          <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6 text-center hover:scale-105 transition-transform">
            <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Analytics Avançado</h3>
            <p className="text-neutral-400 text-sm">Insights comportamentais e predições</p>
          </div>
          
          <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6 text-center hover:scale-105 transition-transform">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Relatórios Automáticos</h3>
            <p className="text-neutral-400 text-sm">Dados exportáveis e dashboards customizáveis</p>
          </div>
        </div>

        {/* CTA Button */}
        <Link href="/dashboard">
          <button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:scale-105 transition-all duration-200">
            Acessar Dashboard
          </button>
        </Link>

        {/* Status */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-sm font-medium">Sistema Online</span>
          </div>
        </div>
      </div>
    </div>
  )
}