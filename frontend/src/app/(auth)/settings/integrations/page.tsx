import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Integrações',
}

export default function IntegrationsPage() {
  const integrations = [
    {
      id: 'slack',
      name: 'Slack',
      description: 'Notificações em tempo real no seu workspace',
      icon: '💬',
      status: 'connected',
      lastSync: '2 min atrás'
    },
    {
      id: 'webhook',
      name: 'Webhooks Personalizados',
      description: 'Envie dados para seus sistemas externos',
      icon: '🔗',
      status: 'configured',
      lastSync: '5 min atrás'
    },
    {
      id: 'email',
      name: 'Email Marketing',
      description: 'Integração com MailChimp e outras plataformas',
      icon: '📧',
      status: 'disconnected',
      lastSync: 'Nunca'
    },
    {
      id: 'analytics',
      name: 'Google Analytics',
      description: 'Sincronização com GA4 para dados complementares',
      icon: '📊',
      status: 'connecting',
      lastSync: '-'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-500 bg-green-500/10'
      case 'configured': return 'text-blue-500 bg-blue-500/10'
      case 'connecting': return 'text-yellow-500 bg-yellow-500/10'
      case 'disconnected': return 'text-red-500 bg-red-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado'
      case 'configured': return 'Configurado'
      case 'connecting': return 'Conectando...'
      case 'disconnected': return 'Desconectado'
      default: return 'N/A'
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Integrações</h1>
        <p className="text-gray-400">Webhooks, APIs externas, apps terceiros e sincronização</p>
      </div>

      {/* Status Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Total</h3>
          <p className="text-3xl font-bold text-blue-500">4</p>
          <p className="text-sm text-gray-400">integrações</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Ativas</h3>
          <p className="text-3xl font-bold text-green-500">2</p>
          <p className="text-sm text-gray-400">funcionando</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Pendentes</h3>
          <p className="text-3xl font-bold text-yellow-500">1</p>
          <p className="text-sm text-gray-400">configuração</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Falhas</h3>
          <p className="text-3xl font-bold text-red-500">1</p>
          <p className="text-sm text-gray-400">desconectada</p>
        </div>
      </div>

      {/* Lista de Integrações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{integration.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
                  <p className="text-sm text-gray-400">{integration.description}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                {getStatusText(integration.status)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Última sinc: {integration.lastSync}
              </span>
              <div className="flex gap-2">
                {integration.status === 'connected' && (
                  <button className="px-3 py-1 bg-neutral-800 text-white rounded text-sm hover:bg-neutral-700 transition-colors">
                    Configurar
                  </button>
                )}
                {integration.status === 'disconnected' && (
                  <button className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors">
                    Conectar
                  </button>
                )}
                {integration.status === 'connected' && (
                  <button className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/20 transition-colors">
                    Desconectar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Webhooks */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Webhooks Configurados</h3>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Adicionar Webhook
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-neutral-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Analytics Webhook</span>
              <span className="text-green-500 text-sm">Ativo</span>
            </div>
            <div className="text-sm text-gray-400 mb-2">
              https://api.example.com/webhooks/analytics
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Última chamada: há 30s</span>
              <div className="flex gap-2">
                <button className="text-blue-400 hover:text-blue-300 text-sm">
                  Editar
                </button>
                <button className="text-red-400 hover:text-red-300 text-sm">
                  Remover
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-neutral-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Alertas Webhook</span>
              <span className="text-yellow-500 text-sm">Teste</span>
            </div>
            <div className="text-sm text-gray-400 mb-2">
              https://hooks.slack.com/services/...
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Última chamada: há 5 min</span>
              <div className="flex gap-2">
                <button className="text-blue-400 hover:text-blue-300 text-sm">
                  Testar
                </button>
                <button className="text-blue-400 hover:text-blue-300 text-sm">
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Configurações de API</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Rate Limit (requests/minuto)
            </label>
            <input
              type="number"
              value={100}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked className="rounded" />
                <span className="text-sm text-white">Logs detalhados</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked className="rounded" />
                <span className="text-sm text-white">Retry automático</span>
              </label>
            </div>
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