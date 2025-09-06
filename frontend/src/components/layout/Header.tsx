'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  Sun, 
  Moon,
  Camera,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { theme, setTheme } = useUIStore()
  const { user, logout } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = React.useState(false)
  const [showNotifications, setShowNotifications] = React.useState(false)

  const notifications = [
    {
      id: '1',
      type: 'camera',
      title: 'Câmera Offline',
      message: 'Câmera da Entrada Principal não responde',
      time: '2 min atrás',
      icon: Camera,
      severity: 'error'
    },
    {
      id: '2',
      type: 'security',
      title: 'Movimento Suspeito',
      message: 'Pessoa não identificada na seção eletrônicos',
      time: '5 min atrás',
      icon: AlertTriangle,
      severity: 'warning'
    }
  ]

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "sticky top-0 z-30 h-16 bg-neutral-900/95 backdrop-blur-xl border-b border-neutral-800/50",
        "flex items-center justify-between px-4 lg:px-6",
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Page Title */}
        <div>
          <h1 className="text-lg font-semibold text-white">
            Dashboard
          </h1>
          <p className="text-sm text-neutral-400 hidden sm:block">
            Bem-vindo ao ShopFlow Analytics
          </p>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className={cn(
              "w-full pl-10 pr-4 py-2 bg-neutral-800/50 border border-neutral-700/50 rounded-lg",
              "text-white placeholder-neutral-400 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50",
              "transition-all duration-200"
            )}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-neutral-400 hover:text-white"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-neutral-400 hover:text-white relative"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </Button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={cn(
                "absolute right-0 top-12 w-80 bg-neutral-900/95 backdrop-blur-xl",
                "border border-neutral-800/50 rounded-lg shadow-2xl z-50"
              )}
            >
              <div className="p-4 border-b border-neutral-800/50">
                <h3 className="text-sm font-semibold text-white">Notificações</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-4 border-b border-neutral-800/30 hover:bg-neutral-800/20">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        notification.severity === 'error' && "bg-red-500/10 text-red-500",
                        notification.severity === 'warning' && "bg-yellow-500/10 text-yellow-500"
                      )}>
                        <notification.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                        <p className="text-xs text-neutral-400 mt-1">{notification.message}</p>
                        <span className="text-xs text-neutral-500 mt-2 block">{notification.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4">
                <Button variant="ghost" size="sm" className="w-full text-neutral-400 hover:text-white">
                  Ver todas as notificações
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 text-neutral-400 hover:text-white"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="hidden md:block text-sm">
              {user?.name || 'Admin'}
            </span>
          </Button>

          {/* User Dropdown */}
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={cn(
                "absolute right-0 top-12 w-48 bg-neutral-900/95 backdrop-blur-xl",
                "border border-neutral-800/50 rounded-lg shadow-2xl z-50"
              )}
            >
              <div className="p-4 border-b border-neutral-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{user?.name || 'Admin'}</div>
                    <div className="text-xs text-neutral-400">{user?.email || 'admin@shopflow.com'}</div>
                  </div>
                </div>
              </div>
              
              <div className="py-2">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800/50 hover:text-white transition-colors">
                  <Settings className="w-4 h-4" />
                  Configurações
                </button>
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false)
            setShowNotifications(false)
          }}
        />
      )}
    </motion.header>
  )
}