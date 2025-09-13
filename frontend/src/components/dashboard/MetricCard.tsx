'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { LiveIndicator } from '@/components/ui/connection-status'

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  color?: 'red' | 'purple' | 'blue' | 'green' | 'orange'
  isLoading?: boolean
  className?: string
  sparklineData?: number[]
  isLive?: boolean
  lastUpdate?: Date
}

export function MetricCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  color = 'red',
  isLoading = false,
  className,
  sparklineData,
  isLive = false,
  lastUpdate
}: MetricCardProps) {
  const colors = {
    red: {
      gradient: 'from-red-500 to-red-600',
      shadow: 'shadow-red-500/25',
      glow: 'shadow-red-500/10 hover:shadow-red-500/20'
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600', 
      shadow: 'shadow-purple-500/25',
      glow: 'shadow-purple-500/10 hover:shadow-purple-500/20'
    },
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/25', 
      glow: 'shadow-blue-500/10 hover:shadow-blue-500/20'
    },
    green: {
      gradient: 'from-green-500 to-green-600',
      shadow: 'shadow-green-500/25',
      glow: 'shadow-green-500/10 hover:shadow-green-500/20'
    },
    orange: {
      gradient: 'from-orange-500 to-orange-600',
      shadow: 'shadow-orange-500/25',
      glow: 'shadow-orange-500/10 hover:shadow-orange-500/20'
    }
  }

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-neutral-400'
  }

  const TrendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus
  }[trend]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className={cn(
        "p-6 bg-neutral-900/50 border-neutral-800/50 hover:bg-neutral-800/30",
        "transition-all duration-300 group cursor-pointer relative overflow-hidden",
        `shadow-xl ${colors[color].glow}`,
        className
      )}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Title with Live Indicator */}
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-medium text-neutral-400">{title}</p>
                <LiveIndicator isLive={isLive} size="sm" />
              </div>
              
              {/* Value */}
              <div className="flex items-baseline gap-2 mb-3">
                {isLoading ? (
                  <div className="h-8 w-24 bg-neutral-800 animate-pulse rounded" />
                ) : (
                  <motion.p 
                    className="text-3xl font-bold text-white"
                    initial={{ scale: 0.8 }}
                    animate={{ 
                      scale: isLive ? 1.05 : 1,
                      color: isLive ? "#10b981" : "#ffffff"
                    }}
                    transition={{ 
                      type: isLive ? "tween" : "spring", 
                      stiffness: 300, 
                      damping: 25,
                      duration: isLive ? 0.3 : 0.2,
                      repeat: isLive ? 1 : 0,
                      repeatType: "reverse"
                    }}
                    key={`${value}-${isLive}`}
                  >
                    {value}
                  </motion.p>
                )}
              </div>

              {/* Change Indicator */}
              {change && (
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm font-medium flex items-center gap-1",
                    trendColors[trend]
                  )}>
                    <TrendIcon className="w-3 h-3" />
                    {change}
                  </span>
                  <span className="text-xs text-neutral-500">vs. ontem</span>
                </div>
              )}
            </div>
            
            {/* Icon */}
            <motion.div
              className={cn(
                "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                colors[color].gradient,
                colors[color].shadow
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <Icon className="w-6 h-6 text-white" />
            </motion.div>
          </div>

          {/* Mini Sparkline */}
          {sparklineData && sparklineData.length > 0 && (
            <div className="mt-4 h-12 relative">
              <MiniSparkline data={sparklineData} color={color} />
            </div>
          )}
        </div>

        {/* Hover Glow Effect */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
          "bg-gradient-to-r",
          colors[color].gradient,
          "blur-xl -z-10"
        )} />

        {/* Live Update Pulse Effect */}
        <AnimatePresence>
          {isLive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0.5, 0], scale: [1, 1.05] }}
              exit={{ opacity: 0, scale: 1 }}
              transition={{
                duration: 0.8,
                ease: "easeOut"
              }}
              className={cn(
                "absolute inset-0 rounded-lg border-2 pointer-events-none -z-5",
                isLive ? "border-green-500/40" : "border-transparent"
              )}
            />
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

// Mini Sparkline Component
interface MiniSparklineProps {
  data: number[]
  color: string
}

function MiniSparkline({ data, color }: MiniSparklineProps) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 100
    return `${x},${y}`
  }).join(' ')

  const colorMap = {
    red: '#ef4444',
    purple: '#a855f7', 
    blue: '#3b82f6',
    green: '#10b981',
    orange: '#f59e0b'
  }

  return (
    <div className="absolute inset-0 flex items-end">
      <svg
        width="100%"
        height="100%"
        className="overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorMap[color as keyof typeof colorMap]} stopOpacity="0.3" />
            <stop offset="100%" stopColor={colorMap[color as keyof typeof colorMap]} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        <polyline
          points={points}
          fill="none"
          stroke={colorMap[color as keyof typeof colorMap]}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          opacity="0.8"
        />
        
        <polygon
          points={`0,100 ${points} 100,100`}
          fill={`url(#gradient-${color})`}
        />
      </svg>
    </div>
  )
}

// Loading Skeleton
export function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-6 bg-neutral-900/50 border-neutral-800/50", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-24 bg-neutral-800 animate-pulse rounded mb-2" />
          <div className="h-8 w-20 bg-neutral-800 animate-pulse rounded mb-3" />
          <div className="h-4 w-16 bg-neutral-800 animate-pulse rounded" />
        </div>
        <div className="w-12 h-12 bg-neutral-800 animate-pulse rounded-xl" />
      </div>
      <div className="mt-4 h-12 bg-neutral-800/50 animate-pulse rounded" />
    </Card>
  )
}