'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  UserPlus, 
  Shield, 
  Crown, 
  Eye,
  Settings,
  MoreVertical,
  Search,
  Filter,
  Key,
  Clock,
  Activity
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'manager' | 'operator' | 'viewer'
  status: 'active' | 'inactive' | 'pending'
  lastSeen: Date
  permissions: string[]
  createdAt: Date
}

interface Role {
  id: string
  name: string
  description: string
  icon: any
  color: string
  permissions: string[]
  userCount: number
}

const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@shopflow.com',
    role: 'owner',
    status: 'active',
    lastSeen: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
    permissions: ['all'],
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@shopflow.com',
    role: 'admin',
    status: 'active',
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
    permissions: ['users', 'settings', 'analytics', 'reports'],
    createdAt: new Date('2024-02-01')
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'carlos@shopflow.com',
    role: 'manager',
    status: 'active',
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4h ago
    permissions: ['analytics', 'employees', 'reports'],
    createdAt: new Date('2024-03-10')
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana@shopflow.com',
    role: 'operator',
    status: 'inactive',
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    permissions: ['cameras', 'employees'],
    createdAt: new Date('2024-04-05')
  },
  {
    id: '5',
    name: 'Pedro Lima',
    email: 'pedro@shopflow.com',
    role: 'viewer',
    status: 'pending',
    lastSeen: new Date(0), // Never
    permissions: ['dashboard'],
    createdAt: new Date('2024-09-01')
  }
]

const ROLES: Role[] = [
  {
    id: 'owner',
    name: 'Proprietário',
    description: 'Acesso total ao sistema, incluindo configurações avançadas',
    icon: Crown,
    color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    permissions: ['all'],
    userCount: 1
  },
  {
    id: 'admin',
    name: 'Administrador',
    description: 'Gerenciamento de usuários, configurações e relatórios',
    icon: Shield,
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
    permissions: ['users', 'settings', 'analytics', 'reports', 'employees'],
    userCount: 1
  },
  {
    id: 'manager',
    name: 'Gerente',
    description: 'Acesso a analytics, funcionários e relatórios operacionais',
    icon: Users,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    permissions: ['analytics', 'employees', 'reports', 'dashboard'],
    userCount: 1
  },
  {
    id: 'operator',
    name: 'Operador',
    description: 'Monitoramento de câmeras e gestão básica de funcionários',
    icon: Settings,
    color: 'text-green-500 bg-green-500/10 border-green-500/20',
    permissions: ['cameras', 'employees', 'dashboard'],
    userCount: 1
  },
  {
    id: 'viewer',
    name: 'Visualizador',
    description: 'Apenas visualização do dashboard e métricas básicas',
    icon: Eye,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    permissions: ['dashboard'],
    userCount: 1
  }
]

export default function UsersPage() {
  const [users] = useState(MOCK_USERS)
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showUserModal, setShowUserModal] = useState(false)

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10'
      case 'inactive': return 'text-red-500 bg-red-500/10'
      case 'pending': return 'text-yellow-500 bg-yellow-500/10'
      default: return 'text-neutral-500 bg-neutral-500/10'
    }
  }

  const getRoleInfo = (roleId: string) => {
    return ROLES.find(role => role.id === roleId)
  }

  const formatLastSeen = (date: Date) => {
    if (date.getTime() === 0) return 'Nunca'
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}min atrás`
    if (hours < 24) return `${hours}h atrás`
    if (days < 7) return `${days}d atrás`
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Gerenciamento de Usuários
          </h2>
          <p className="text-neutral-400 mt-1">
            Gerencie usuários, roles e permissões do sistema
          </p>
        </div>
        
        <button
          onClick={() => setShowUserModal(true)}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Novo Usuário
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-sm font-medium text-blue-400">{users.length}</div>
              <div className="text-xs text-neutral-500">Total Usuários</div>
            </div>
          </div>
        </div>
        
        <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-sm font-medium text-green-400">
                {users.filter(u => u.status === 'active').length}
              </div>
              <div className="text-xs text-neutral-500">Usuários Ativos</div>
            </div>
          </div>
        </div>
        
        <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <div>
              <div className="text-sm font-medium text-orange-400">
                {users.filter(u => u.status === 'pending').length}
              </div>
              <div className="text-xs text-neutral-500">Pendentes</div>
            </div>
          </div>
        </div>
        
        <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-purple-500" />
            <div>
              <div className="text-sm font-medium text-purple-400">{ROLES.length}</div>
              <div className="text-xs text-neutral-500">Roles Disponíveis</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Roles Overview */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-purple-500" />
          Roles e Permissões
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLES.map((role, index) => {
            const RoleIcon = role.icon
            return (
              <motion.div
                key={role.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`p-4 rounded-xl border ${role.color}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <RoleIcon className={`w-5 h-5 ${role.color.split(' ')[0]}`} />
                  <span className="text-xs font-medium text-neutral-400">
                    {role.userCount} usuário{role.userCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <h4 className="font-medium text-white mb-1">{role.name}</h4>
                <p className="text-xs text-neutral-400 mb-3">{role.description}</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 3).map(permission => (
                    <span
                      key={permission}
                      className="px-2 py-0.5 bg-neutral-800 text-neutral-300 text-xs rounded"
                    >
                      {permission}
                    </span>
                  ))}
                  {role.permissions.length > 3 && (
                    <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 text-xs rounded">
                      +{role.permissions.length - 3}
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-4"
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">Todas as Roles</option>
          {ROLES.map(role => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-neutral-900/50 border border-neutral-800/50 rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-800/50 border-b border-neutral-700/50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-neutral-300">Usuário</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-neutral-300">Role</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-neutral-300">Status</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-neutral-300">Último Acesso</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-neutral-300">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => {
                const roleInfo = getRoleInfo(user.role)
                const RoleIcon = roleInfo?.icon
                
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="border-b border-neutral-800/30 hover:bg-neutral-800/20 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-sm text-neutral-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {RoleIcon && <RoleIcon className={`w-4 h-4 ${roleInfo?.color.split(' ')[0]}`} />}
                        <span className="text-sm text-white">{roleInfo?.name}</span>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(user.status)}`}>
                        {user.status === 'active' ? 'Ativo' : 
                         user.status === 'inactive' ? 'Inativo' : 'Pendente'}
                      </span>
                    </td>
                    
                    <td className="py-4 px-6">
                      <span className="text-sm text-neutral-300">
                        {formatLastSeen(user.lastSeen)}
                      </span>
                    </td>
                    
                    <td className="py-4 px-6">
                      <button className="p-2 hover:bg-neutral-700 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-neutral-400" />
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}