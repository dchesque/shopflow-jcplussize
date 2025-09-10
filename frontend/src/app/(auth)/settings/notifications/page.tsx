import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Configurações de Notificações',
}

export default function NotificationsPage() {
  const notificationRules = [
    {
      id: 'high-traffic',
      name: 'Tráfego Alto',
      description: 'Quando o número de pessoas exceder 50',
      enabled: true,
      channels: ['email', 'push'],
      threshold: '50 pessoas',
      frequency: 'Imediato'
    },
    {
      id: 'low-traffic',
      name: 'Tráfego Baixo', 
      description: 'Quando a loja estiver muito vazia por mais de 30min',
      enabled: false,
      channels: ['push'],
      threshold: '<5 pessoas por 30min',
      frequency: 'A cada 30 min'
    },
    {
      id: 'camera-offline',
      name: 'Câmera Offline',
      description: 'Quando uma câmera parar de responder',
      enabled: true,
      channels: ['email', 'push', 'sms'],
      threshold: 'Imediato',
      frequency: 'Crítico'
    },
    {
      id: 'suspicious-activity',
      name: 'Atividade Suspeita',
      description: 'Detecção de comportamento anômalo',
      enabled: true,
      channels: ['push', 'sms'],
      threshold: 'Score > 0.8',
      frequency: 'Imediato'
    }
  ]

  const channels = [
    { id: 'email', name: 'Email', icon: '📧', enabled: true },
    { id: 'push', name: 'Push', icon: '🔔', enabled: true },
    { id: 'sms', name: 'SMS', icon: '📱', enabled: false },
    { id: 'slack', name: 'Slack', icon: '💬', enabled: true }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Configurações de Notificações</h1>
        <p className="text-gray-400">Regras de alertas, email, SMS e push notifications</p>
      </div>

      {/* Canais de Notificação */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Canais de Notificação</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {channels.map((channel) => (
            <div key={channel.id} className="p-4 bg-neutral-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{channel.icon}</span>
                  <span className="text-white font-medium">{channel.name}</span>
                </div>
                <div className={`w-10 h-5 rounded-full flex items-center transition-colors ${
                  channel.enabled ? 'bg-green-500' : 'bg-gray-600'
                }`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    channel.enabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}></div>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {channel.enabled ? 'Ativo' : 'Desabilitado'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configurações por Canal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Configurações de Email</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email do Administrador
              </label>
              <input
                type="email"
                value="admin@shopflow.com"
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Frequência de Resumos
              </label>
              <select className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white">
                <option>Diário (manhã)</option>
                <option>Semanal (segunda)</option>
                <option>Mensal</option>
                <option>Desabilitado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Configurações SMS</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Número Principal
              </label>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Provedor SMS
              </label>
              <select className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white">
                <option>Twilio</option>
                <option>AWS SNS</option>
                <option>TotalVoice</option>
              </select>
            </div>
            <div className="text-xs text-yellow-400">
              ⚠️ Configuração necessária para ativar SMS
            </div>
          </div>
        </div>
      </div>

      {/* Regras de Notificação */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Regras de Notificação</h3>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Nova Regra
          </button>
        </div>
        
        <div className="space-y-4">
          {notificationRules.map((rule) => (
            <div key={rule.id} className="p-4 bg-neutral-800/50 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-white font-medium">{rule.name}</h4>
                    <div className={`w-8 h-4 rounded-full flex items-center transition-colors ${
                      rule.enabled ? 'bg-green-500' : 'bg-gray-600'
                    }`}>
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                        rule.enabled ? 'translate-x-4' : 'translate-x-0.5'
                      }`}></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{rule.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {rule.channels.map((channel) => (
                      <span key={channel} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm text-white mb-1">{rule.threshold}</div>
                  <div className="text-xs text-gray-500">{rule.frequency}</div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button className="px-3 py-1 text-blue-400 hover:text-blue-300 text-sm">
                  Editar
                </button>
                <button className="px-3 py-1 text-red-400 hover:text-red-300 text-sm">
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Horários de Silêncio */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Horários de Silêncio</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Não perturbe - Início
            </label>
            <input
              type="time"
              value="22:00"
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Não perturbe - Fim
            </label>
            <input
              type="time"
              value="08:00"
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked className="rounded" />
            <span className="text-sm text-white">Aplicar apenas para notificações não-críticas</span>
          </label>
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