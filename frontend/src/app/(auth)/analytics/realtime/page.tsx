import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analytics em Tempo Real',
}

export default function RealtimeAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics em Tempo Real</h1>
        <p className="text-gray-400">Monitore métricas e atividades em tempo real</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Pessoas Online</h3>
          <p className="text-3xl font-bold text-green-500">127</p>
          <p className="text-sm text-gray-400">+12% vs última hora</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Tempo Médio</h3>
          <p className="text-3xl font-bold text-blue-500">8.5min</p>
          <p className="text-sm text-gray-400">-2% vs última hora</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Taxa Conversão</h3>
          <p className="text-3xl font-bold text-yellow-500">23.4%</p>
          <p className="text-sm text-gray-400">+5% vs última hora</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Alertas Ativos</h3>
          <p className="text-3xl font-bold text-red-500">3</p>
          <p className="text-sm text-gray-400">2 críticos, 1 aviso</p>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Feed de Atividades</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-neutral-700">
            <span className="text-white">Novo pico de visitantes detectado</span>
            <span className="text-sm text-gray-400">há 2 min</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-neutral-700">
            <span className="text-white">Câmera #3 voltou online</span>
            <span className="text-sm text-gray-400">há 5 min</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-white">Meta de conversão atingida</span>
            <span className="text-sm text-gray-400">há 12 min</span>
          </div>
        </div>
      </div>
    </div>
  )
}