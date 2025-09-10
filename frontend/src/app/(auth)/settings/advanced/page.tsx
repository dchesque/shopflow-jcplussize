import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Configurações Avançadas',
}

export default function AdvancedSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Configurações Avançadas</h1>
        <p className="text-gray-400">Logs, debug, cache, performance e configurações técnicas</p>
      </div>

      {/* Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">CPU</h3>
          <p className="text-3xl font-bold text-blue-500">23%</p>
          <p className="text-sm text-gray-400">uso médio</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Memória</h3>
          <p className="text-3xl font-bold text-green-500">67%</p>
          <p className="text-sm text-gray-400">4.2GB / 8GB</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Disco</h3>
          <p className="text-3xl font-bold text-yellow-500">45%</p>
          <p className="text-sm text-gray-400">180GB / 500GB</p>
        </div>
      </div>

      {/* Configurações de Cache */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Configurações de Cache</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                TTL do Cache (segundos)
              </label>
              <input
                type="number"
                value={3600}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tamanho Máximo (MB)
              </label>
              <input
                type="number"
                value={512}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked className="rounded" />
                <span className="text-sm text-white">Cache de imagens</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked className="rounded" />
                <span className="text-sm text-white">Cache de API responses</span>
              </label>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-neutral-800/30 rounded-lg">
              <h4 className="text-white font-medium mb-2">Status do Cache</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Hit Rate:</span>
                  <span className="text-green-500">89%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Uso Atual:</span>
                  <span className="text-blue-500">234MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Objetos:</span>
                  <span className="text-white">1,247</span>
                </div>
              </div>
            </div>
            <button className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
              Limpar Cache
            </button>
          </div>
        </div>
      </div>

      {/* Configurações de Debug */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Configurações de Debug</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Nível de Log
              </label>
              <select className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white">
                <option>ERROR</option>
                <option>WARN</option>
                <option>INFO</option>
                <option>DEBUG</option>
                <option>TRACE</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-white">Logs de SQL queries</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-white">Logs de API calls</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked className="rounded" />
                <span className="text-sm text-white">Performance metrics</span>
              </label>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Rotação de Logs (dias)
              </label>
              <input
                type="number"
                value={30}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tamanho Máximo por Arquivo (MB)
              </label>
              <input
                type="number"
                value={100}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <button className="w-full py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors">
              Download Logs
            </button>
          </div>
        </div>
      </div>

      {/* Performance e Rate Limiting */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Worker Processes
              </label>
              <input
                type="number"
                value={4}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Connection Pool Size
              </label>
              <input
                type="number"
                value={20}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Request Timeout (ms)
              </label>
              <input
                type="number"
                value={30000}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Rate Limiting</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                API Requests/minuto
              </label>
              <input
                type="number"
                value={100}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Login Attempts/hora
              </label>
              <input
                type="number"
                value={5}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked className="rounded" />
                <span className="text-sm text-white">Bloquear IP após limite</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Variáveis de Ambiente */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Variáveis de Ambiente</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between p-2 bg-neutral-800/30 rounded">
            <span className="text-white font-mono text-sm">NODE_ENV</span>
            <span className="text-green-500 text-sm">production</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-neutral-800/30 rounded">
            <span className="text-white font-mono text-sm">DATABASE_URL</span>
            <span className="text-gray-400 text-sm">postgres://***</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-neutral-800/30 rounded">
            <span className="text-white font-mono text-sm">REDIS_URL</span>
            <span className="text-gray-400 text-sm">redis://***</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-neutral-800/30 rounded">
            <span className="text-white font-mono text-sm">API_VERSION</span>
            <span className="text-blue-500 text-sm">v1.2.0</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-neutral-800/30 rounded">
            <span className="text-white font-mono text-sm">MAX_FILE_SIZE</span>
            <span className="text-white text-sm">10MB</span>
          </div>
        </div>
      </div>

      {/* Manutenção */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Manutenção</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors">
            <div className="text-lg font-semibold mb-1">Reiniciar Serviços</div>
            <div className="text-sm">Reinicia todos os workers</div>
          </button>
          <button className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/20 transition-colors">
            <div className="text-lg font-semibold mb-1">Modo Manutenção</div>
            <div className="text-sm">Ativar página de manutenção</div>
          </button>
          <button className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
            <div className="text-lg font-semibold mb-1">Reset Sistema</div>
            <div className="text-sm">Reinicialização completa</div>
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button className="px-6 py-2 border border-neutral-600 text-neutral-300 rounded-lg hover:bg-neutral-800 transition-colors">
          Cancelar
        </button>
        <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
          Aplicar Configurações
        </button>
      </div>
    </div>
  )
}