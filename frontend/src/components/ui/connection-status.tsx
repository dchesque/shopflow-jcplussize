'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, Clock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConnectionStatusProps {
  status: 'connected' | 'connecting' | 'disconnected'
  lastHeartbeat?: Date | null
  className?: string
  showLabel?: boolean
  showLastUpdate?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ConnectionStatus({
  status,
  lastHeartbeat,
  className,
  showLabel = true,
  showLastUpdate = false,
  size = 'md'
}: ConnectionStatusProps) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: Zap,
          label: 'Tempo Real',
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          pulseColor: 'bg-green-500'
        }
      case 'connecting':
        return {
          icon: Clock,
          label: 'Conectando...',
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
          pulseColor: 'bg-yellow-500'
        }
      case 'disconnected':
        return {
          icon: WifiOff,
          label: 'Desconectado',
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          pulseColor: 'bg-red-500'
        }
    }
  }

  const config = getStatusConfig()
  const IconComponent = config.icon

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return null
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    
    if (diffSeconds < 60) {
      return `${diffSeconds}s atrás`
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m atrás`
    } else {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300',
      config.bgColor,
      config.borderColor,
      'border',
      sizeClasses[size],
      className
    )}>
      {/* Pulse indicator for connected state */}
      <div className="relative">
        <AnimatePresence>
          {status === 'connected' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1.2, opacity: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut'
              }}
              className={cn(
                'absolute inset-0 rounded-full',
                config.pulseColor
              )}
            />
          )}
        </AnimatePresence>
        
        <motion.div
          animate={status === 'connecting' ? {
            rotate: 360
          } : {}}
          transition={{
            duration: 2,
            repeat: status === 'connecting' ? Infinity : 0,
            ease: 'linear'
          }}
        >
          <IconComponent className={cn(
            iconSizes[size],
            config.color,
            'relative z-10'
          )} />
        </motion.div>
      </div>

      {showLabel && (
        <span className={cn('font-medium', config.color)}>
          {config.label}
        </span>
      )}

      {showLastUpdate && lastHeartbeat && status === 'connected' && (
        <span className="text-neutral-400 text-xs">
          • {formatLastUpdate(lastHeartbeat)}
        </span>
      )}
    </div>
  )
}

// Live data indicator component
interface LiveIndicatorProps {
  isLive: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LiveIndicator({
  isLive,
  className,
  size = 'md'
}: LiveIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  return (
    <div className={cn('relative', className)}>
      <AnimatePresence>
        {isLive && (
          <>
            {/* Pulse ring */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                duration: 1,
                ease: 'easeOut'
              }}
              className={cn(
                'absolute inset-0 rounded-full bg-green-500',
                sizeClasses[size]
              )}
            />
            
            {/* Core dot */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className={cn(
                'rounded-full bg-green-500 relative z-10',
                sizeClasses[size]
              )}
            />
          </>
        )}
      </AnimatePresence>
      
      {!isLive && (
        <div className={cn(
          'rounded-full bg-neutral-600',
          sizeClasses[size]
        )} />
      )}
    </div>
  )
}

// Connection banner for important connection status changes
interface ConnectionBannerProps {
  show: boolean
  status: 'connected' | 'disconnected' | 'reconnecting'
  onDismiss?: () => void
}

export function ConnectionBanner({
  show,
  status,
  onDismiss
}: ConnectionBannerProps) {
  const getBannerConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: Wifi,
          title: 'Conectado ao Tempo Real',
          message: 'Dados sendo atualizados em tempo real',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          textColor: 'text-green-400'
        }
      case 'disconnected':
        return {
          icon: WifiOff,
          title: 'Conexão Perdida',
          message: 'Tentando reconectar...',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400'
        }
      case 'reconnecting':
        return {
          icon: Clock,
          title: 'Reconectando',
          message: 'Restabelecendo conexão em tempo real...',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-400'
        }
    }
  }

  const config = getBannerConfig()
  const IconComponent = config.icon

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            'fixed top-20 left-1/2 transform -translate-x-1/2 z-50',
            'px-4 py-3 rounded-lg border',
            'flex items-center gap-3',
            'backdrop-blur-sm',
            config.bgColor,
            config.borderColor
          )}
        >
          <motion.div
            animate={status === 'reconnecting' ? {
              rotate: 360
            } : {}}
            transition={{
              duration: 2,
              repeat: status === 'reconnecting' ? Infinity : 0,
              ease: 'linear'
            }}
          >
            <IconComponent className={cn('w-4 h-4', config.textColor)} />
          </motion.div>
          
          <div>
            <p className={cn('font-medium text-sm', config.textColor)}>
              {config.title}
            </p>
            <p className="text-xs text-neutral-400">
              {config.message}
            </p>
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className={cn(
                'ml-2 text-xs px-2 py-1 rounded',
                'hover:bg-white/10 transition-colors',
                config.textColor
              )}
            >
              ×
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}