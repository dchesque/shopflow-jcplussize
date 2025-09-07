'use client'

import { motion } from 'framer-motion'
import { 
  Shield, 
  Users, 
  Key, 
  Store, 
  Globe, 
  Bell,
  Database,
  Settings2,
  Lock,
  UserCheck,
  AlertTriangle,
  Clock
} from 'lucide-react'
import Link from 'next/link'

interface SettingsCard {
  id: string
  title: string
  description: string
  icon: any
  href: string
  status?: 'active' | 'inactive' | 'warning'
  badge?: string
}

const SETTINGS_SECTIONS: SettingsCard[] = [
  // Privacidade e Segurança
  {
    id: 'privacy',
    title: 'Privacidade e LGPD',
    description: 'Configurações de conformidade, retenção de dados e anonimização',
    icon: Shield,
    href: '/settings/privacy',
    status: 'active',
  },
  {
    id: 'users',
    title: 'Gerenciamento de Usuários',
    description: 'Usuários, roles, permissões e controle de acesso',
    icon: Users,
    href: '/settings/users',
    status: 'active',
  },
  {
    id: 'security',
    title: 'Segurança',
    description: '2FA, políticas de senha, whitelist IP e chaves API',
    icon: Key,
    href: '/settings/security',
    status: 'warning',
    badge: 'Config',
  },
  // Configurações da Loja
  {
    id: 'store',
    title: 'Informações da Loja',
    description: 'Dados básicos, horários, capacidade e configuração de zonas',
    icon: Store,
    href: '/settings/store',
    status: 'active',
  },
  {
    id: 'integrations',
    title: 'Integrações',
    description: 'Webhooks, APIs externas, apps terceiros e sincronização',
    icon: Globe,
    href: '/settings/integrations',
    status: 'inactive',
    badge: 'Beta',
  },
  {
    id: 'notifications',
    title: 'Notificações',
    description: 'Regras de alertas, email, SMS e push notifications',
    icon: Bell,
    href: '/settings/notifications',
    status: 'active',
  },
  // Sistema
  {
    id: 'database',
    title: 'Banco de Dados',
    description: 'Backup, limpeza, performance e manutenção',
    icon: Database,
    href: '/settings/database',
    status: 'active',
  },
  {
    id: 'advanced',
    title: 'Avançado',
    description: 'Logs, debug, cache, performance e configurações técnicas',
    icon: Settings2,
    href: '/settings/advanced',
    status: 'active',
  },
]

const QUICK_ACTIONS = [
  {
    id: 'backup',
    title: 'Backup Completo',
    icon: Database,
    description: 'Realizar backup manual dos dados',
    urgent: false,
  },
  {
    id: 'audit',
    title: 'Auditoria LGPD',
    icon: Lock,
    description: 'Gerar relatório de conformidade',
    urgent: false,
  },
  {
    id: 'users-review',
    title: 'Revisar Usuários',
    icon: UserCheck,
    description: '3 usuários inativos há mais de 30 dias',
    urgent: true,
  },
  {
    id: 'security-check',
    title: 'Verificação Segurança',
    icon: AlertTriangle,
    description: 'Última verificação há 7 dias',
    urgent: true,
  },
]

export default function SettingsPage() {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500 bg-green-500/10 border-green-500/20'
      case 'inactive':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
      case 'warning':
        return 'text-red-500 bg-red-500/10 border-red-500/20'
      default:
        return 'text-neutral-500 bg-neutral-500/10 border-neutral-500/20'
    }
  }

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'Config':
        return 'bg-orange-500 text-white'
      case 'Beta':
        return 'bg-purple-500 text-white'
      case 'NEW':
        return 'bg-green-500 text-white'
      default:
        return 'bg-blue-500 text-white'
    }
  }

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`
                p-4 rounded-xl border transition-all duration-200 hover:scale-105 cursor-pointer
                ${action.urgent 
                  ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10' 
                  : 'bg-neutral-900/50 border-neutral-800/50 hover:bg-neutral-800/50'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  p-2 rounded-lg
                  ${action.urgent ? 'bg-red-500/20' : 'bg-neutral-800/50'}
                `}>
                  <action.icon className={`
                    w-4 h-4
                    ${action.urgent ? 'text-red-400' : 'text-neutral-400'}
                  `} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white mb-1">
                    {action.title}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {action.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Settings Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-blue-500" />
          Configurações do Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SETTINGS_SECTIONS.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Link
                href={section.href}
                className="block p-6 rounded-2xl border border-neutral-800/50 bg-neutral-900/50 backdrop-blur-sm hover:bg-neutral-800/50 hover:border-neutral-700/50 transition-all duration-300 hover:scale-105 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/10 to-purple-500/10 border border-red-500/20">
                    <section.icon className="w-6 h-6 text-red-400 group-hover:text-red-300 transition-colors" />
                  </div>
                  <div className="flex items-center gap-2">
                    {section.badge && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getBadgeColor(section.badge)}`}>
                        {section.badge}
                      </span>
                    )}
                    {section.status && (
                      <div className={`w-3 h-3 rounded-full border ${getStatusColor(section.status)}`} />
                    )}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-red-300 transition-colors">
                  {section.title}
                </h3>
                
                <p className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">
                  {section.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Status do Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500 mb-1">99.9%</div>
            <div className="text-sm text-neutral-400">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500 mb-1">2.3GB</div>
            <div className="text-sm text-neutral-400">Uso de Dados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500 mb-1">156</div>
            <div className="text-sm text-neutral-400">Usuários Ativos</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}