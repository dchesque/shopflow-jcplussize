import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Configurações do Banco de Dados',
}

export default function DatabasePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Banco de Dados</h1>
        <p className="text-gray-400">Backup, limpeza, performance e manutenção</p>
      </div>

      {/* Status do Banco */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Status</h3>
          <p className="text-3xl font-bold text-green-500">Online</p>
          <p className="text-sm text-gray-400">99.9% uptime</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Tamanho</h3>
          <p className="text-3xl font-bold text-blue-500">2.3GB</p>
          <p className="text-sm text-gray-400">+150MB hoje</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Conexões</h3>
          <p className="text-3xl font-bold text-purple-500">12/50</p>
          <p className="text-sm text-gray-400">ativas agora</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Último Backup</h3>
          <p className="text-2xl font-bold text-orange-500">2h atrás</p>
          <p className="text-sm text-gray-400">automático</p>
        </div>
      </div>

      {/* Configurações de Backup */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Configurações de Backup</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Frequência de Backup Automático
              </label>
              <select className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white">
                <option>A cada 6 horas</option>
                <option>Diário</option>
                <option>A cada 12 horas</option>
                <option>Semanal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Retenção de Backups
              </label>
              <select className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white">
                <option>30 dias</option>
                <option>60 dias</option>
                <option>90 dias</option>
                <option>1 ano</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked className="rounded" />
                <span className="text-sm text-white">Compressão de backup</span>
              </label>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Local de Armazenamento
              </label>
              <select className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white">
                <option>AWS S3</option>
                <option>Local</option>
                <option>Google Cloud</option>
                <option>Azure Storage</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Criptografia
              </label>
              <select className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white">
                <option>AES-256</option>
                <option>AES-128</option>
                <option>Sem criptografia</option>
              </select>
            </div>
            <button className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              Executar Backup Manual
            </button>
          </div>
        </div>
      </div>

      {/* Histórico de Backups */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Histórico de Backups</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
            <div>
              <div className="text-white font-medium">backup_2024_09_09_14_00.sql.gz</div>
              <div className="text-sm text-gray-400">2.1GB • Automático • Sucesso</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">há 2h</span>
              <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors">
                Download
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
            <div>
              <div className="text-white font-medium">backup_2024_09_09_08_00.sql.gz</div>
              <div className="text-sm text-gray-400">2.0GB • Automático • Sucesso</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">há 8h</span>
              <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors">
                Download
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
            <div>
              <div className="text-white font-medium">backup_2024_09_08_20_00.sql.gz</div>
              <div className="text-sm text-gray-400">1.9GB • Automático • Sucesso</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">ontem</span>
              <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors">
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Limpeza e Manutenção */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Limpeza de Dados</h3>
          <div className="space-y-4">
            <div className="p-3 bg-neutral-800/30 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm">Logs antigos (&gt;90 dias)</span>
                <span className="text-yellow-500 text-sm">450MB</span>
              </div>
              <button className="w-full py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/20 transition-colors">
                Limpar
              </button>
            </div>
            <div className="p-3 bg-neutral-800/30 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm">Dados temporários</span>
                <span className="text-blue-500 text-sm">125MB</span>
              </div>
              <button className="w-full py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/20 transition-colors">
                Limpar
              </button>
            </div>
            <div className="p-3 bg-neutral-800/30 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm">Sessões expiradas</span>
                <span className="text-green-500 text-sm">12MB</span>
              </div>
              <button className="w-full py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/20 transition-colors">
                Limpar
              </button>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white">Query cache</span>
              <span className="text-green-500">85% hit rate</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Índices</span>
              <span className="text-green-500">Otimizados</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Fragmentação</span>
              <span className="text-yellow-500">8% (OK)</span>
            </div>
            <button className="w-full py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors">
              Executar Análise Completa
            </button>
            <button className="w-full py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors">
              Otimizar Tabelas
            </button>
          </div>
        </div>
      </div>

      {/* Logs de Atividade */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Logs de Atividade</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between py-1 text-sm">
            <span className="text-white">Backup automático concluído</span>
            <span className="text-gray-400">14:00</span>
          </div>
          <div className="flex items-center justify-between py-1 text-sm">
            <span className="text-white">Conexão estabelecida - API</span>
            <span className="text-gray-400">13:45</span>
          </div>
          <div className="flex items-center justify-between py-1 text-sm">
            <span className="text-yellow-400">Índice reconstruído - analytics</span>
            <span className="text-gray-400">13:30</span>
          </div>
          <div className="flex items-center justify-between py-1 text-sm">
            <span className="text-white">Query executada - dashboard</span>
            <span className="text-gray-400">13:25</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button className="px-6 py-2 border border-neutral-600 text-neutral-300 rounded-lg hover:bg-neutral-800 transition-colors">
          Cancelar
        </button>
        <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
          Salvar Configurações
        </button>
      </div>
    </div>
  )
}