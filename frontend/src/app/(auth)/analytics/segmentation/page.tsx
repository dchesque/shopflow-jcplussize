import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Segmentação de Público',
}

export default function SegmentationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Segmentação de Público</h1>
        <p className="text-gray-400">Analise diferentes segmentos de visitantes e comportamentos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Por Faixa Etária</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white">18-25 anos</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-neutral-700 rounded-full">
                  <div className="w-16 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-400">32%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">26-35 anos</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-neutral-700 rounded-full">
                  <div className="w-20 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-400">41%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">36-50 anos</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-neutral-700 rounded-full">
                  <div className="w-8 h-2 bg-yellow-500 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-400">18%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">50+ anos</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-neutral-700 rounded-full">
                  <div className="w-4 h-2 bg-red-500 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-400">9%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Por Comportamento</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white">Visitantes Frequentes</span>
              <span className="text-sm text-green-500">45%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Primeira Visita</span>
              <span className="text-sm text-blue-500">28%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Visitantes Ocasionais</span>
              <span className="text-sm text-yellow-500">19%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">VIPs</span>
              <span className="text-sm text-purple-500">8%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Análise Temporal</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">Morning</p>
            <p className="text-sm text-gray-400">6h-12h</p>
            <p className="text-white">23% do tráfego</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">Afternoon</p>
            <p className="text-sm text-gray-400">12h-18h</p>
            <p className="text-white">42% do tráfego</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-500">Evening</p>
            <p className="text-sm text-gray-400">18h-22h</p>
            <p className="text-white">28% do tráfego</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">Night</p>
            <p className="text-sm text-gray-400">22h-6h</p>
            <p className="text-white">7% do tráfego</p>
          </div>
        </div>
      </div>
    </div>
  )
}