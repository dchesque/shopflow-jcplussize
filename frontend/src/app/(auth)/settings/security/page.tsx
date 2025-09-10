import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Configurações de Segurança',
}

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Configurações de Segurança</h1>
        <p className="text-gray-400">2FA, políticas de senha, whitelist IP e chaves API</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Autenticação em Duas Etapas */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Autenticação em Duas Etapas</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white">2FA Habilitado</span>
              <div className="w-12 h-6 bg-green-500 rounded-full flex items-center">
                <div className="w-5 h-5 bg-white rounded-full ml-1"></div>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Último uso: há 2 horas
            </div>
            <button className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
              Regenerar Códigos de Backup
            </button>
          </div>
        </div>

        {/* Política de Senhas */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Política de Senhas</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-300">Mínimo 8 caracteres</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-300">Letras maiúsculas e minúsculas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-300">Números obrigatórios</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-300">Caracteres especiais (recomendado)</span>
            </div>
            <div className="pt-3">
              <select className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white">
                <option>Expiração: 90 dias</option>
                <option>Expiração: 60 dias</option>
                <option>Expiração: 30 dias</option>
              </select>
            </div>
          </div>
        </div>

        {/* Whitelist IP */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Controle de IP</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-neutral-800 rounded">
              <span className="text-white text-sm">192.168.1.100</span>
              <span className="text-green-500 text-xs">Permitido</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-neutral-800 rounded">
              <span className="text-white text-sm">10.0.0.50</span>
              <span className="text-green-500 text-xs">Permitido</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Novo IP..."
                className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white text-sm"
              />
              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                Adicionar
              </button>
            </div>
          </div>
        </div>

        {/* Chaves API */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Chaves API</h3>
          <div className="space-y-3">
            <div className="p-3 bg-neutral-800 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium">API Principal</span>
                <span className="text-green-500 text-xs">Ativa</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs text-gray-400 bg-neutral-700 p-1 rounded flex-1">
                  sk_live_****************************
                </code>
                <button className="text-blue-400 hover:text-blue-300 text-xs">
                  Copiar
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Criada em: 15/08/2024
              </div>
            </div>
            <button className="w-full py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors">
              Gerar Nova Chave
            </button>
          </div>
        </div>
      </div>

      {/* Logs de Segurança */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Logs de Segurança</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-neutral-700">
            <div>
              <p className="text-white text-sm">Login bem-sucedido</p>
              <p className="text-gray-500 text-xs">192.168.1.100</p>
            </div>
            <span className="text-gray-400 text-xs">há 2 min</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-neutral-700">
            <div>
              <p className="text-white text-sm">Chave API utilizada</p>
              <p className="text-gray-500 text-xs">Endpoint: /api/analytics</p>
            </div>
            <span className="text-gray-400 text-xs">há 15 min</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-yellow-400 text-sm">Tentativa de login falhada</p>
              <p className="text-gray-500 text-xs">203.45.67.89</p>
            </div>
            <span className="text-gray-400 text-xs">há 1 hora</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button className="px-6 py-2 border border-neutral-600 text-neutral-300 rounded-lg hover:bg-neutral-800 transition-colors">
          Cancelar
        </button>
        <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
          Salvar Alterações
        </button>
      </div>
    </div>
  )
}