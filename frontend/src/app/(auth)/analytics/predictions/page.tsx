import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Predições Analytics',
}

export default function PredictionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Predições Analytics</h1>
        <p className="text-gray-600">Análises preditivas avançadas e forecasts baseados em IA para otimização de negócios</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Predições de Fluxo</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white">Próxima hora</span>
              <span className="text-green-500 font-semibold">+15% visitantes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Próximas 3 horas</span>
              <span className="text-blue-500 font-semibold">Pico às 16:30</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Final do dia</span>
              <span className="text-yellow-500 font-semibold">Meta: 85% atingida</span>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Padrões Identificados</h3>
          <div className="space-y-3">
            <div className="p-3 bg-neutral-800 rounded">
              <p className="text-white text-sm">Alto movimento após 14:00</p>
              <p className="text-gray-400 text-xs">Confiança: 92%</p>
            </div>
            <div className="p-3 bg-neutral-800 rounded">
              <p className="text-white text-sm">Queda natural às terças</p>
              <p className="text-gray-400 text-xs">Confiança: 87%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recomendações</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded">
            <h4 className="text-green-400 font-semibold mb-2">Otimizar Pessoal</h4>
            <p className="text-sm text-gray-300">Aumentar equipe entre 15h-17h</p>
          </div>
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded">
            <h4 className="text-blue-400 font-semibold mb-2">Promoções</h4>
            <p className="text-sm text-gray-300">Lançar ofertas nas manhãs de terça</p>
          </div>
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded">
            <h4 className="text-purple-400 font-semibold mb-2">Estoque</h4>
            <p className="text-sm text-gray-300">Preparar seção eletrônicos para pico</p>
          </div>
        </div>
      </div>
    </div>
  )
}