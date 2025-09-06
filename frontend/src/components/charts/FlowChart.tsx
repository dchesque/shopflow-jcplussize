'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface FlowData {
  timestamp: string
  customers: number
  employees: number
  total: number
  hour: string
}

interface FlowChartProps {
  data: FlowData[]
  title?: string
  subtitle?: string
  timeRange?: '24h' | '7d' | '30d'
  onTimeRangeChange?: (range: '24h' | '7d' | '30d') => void
  className?: string
  height?: number
}

export function FlowChart({
  data,
  title = "Fluxo de Pessoas",
  subtitle = "Últimas 24 horas",
  timeRange = '24h',
  onTimeRangeChange,
  className,
  height = 300
}: FlowChartProps) {
  const [selectedArea, setSelectedArea] = React.useState<'total' | 'customers' | 'employees' | null>('total')
  
  const timeRangeOptions = [
    { value: '24h', label: 'Hoje' },
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' }
  ]

  // Calcular métricas
  const metrics = React.useMemo(() => {
    if (!data.length) return { peak: 0, average: 0, current: 0 }
    
    const peak = Math.max(...data.map(d => d.total))
    const average = Math.round(data.reduce((sum, d) => sum + d.total, 0) / data.length)
    const current = data[data.length - 1]?.total || 0
    
    return { peak, average, current }
  }, [data])

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length || !label) return null

    try {
      return (
        <div className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-800/50 rounded-lg p-3 shadow-2xl">
          <p className="text-sm font-medium text-white mb-2">
            {format(new Date(label), 'HH:mm', { locale: ptBR })}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-neutral-300 capitalize">{entry.dataKey}:</span>
              <span className="text-white font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      )
    } catch (error) {
      // Fallback if date formatting fails
      return (
        <div className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-800/50 rounded-lg p-3 shadow-2xl">
          <p className="text-sm font-medium text-white mb-2">
            {String(label) || 'N/A'}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-neutral-300 capitalize">{entry.dataKey}:</span>
              <span className="text-white font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      )
    }
  }

  return (
    <Card className={cn(
      "p-6 bg-neutral-900/95 backdrop-blur-xl border-neutral-800/50",
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && (
            <p className="text-sm text-neutral-400 mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex bg-neutral-800/50 rounded-lg p-1">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onTimeRangeChange?.(option.value as any)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-all duration-200",
                  timeRange === option.value
                    ? "bg-red-500 text-white shadow-lg"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-700/50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          className="bg-neutral-800/30 rounded-lg p-3 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-2xl font-bold text-white">{metrics.current}</p>
          <p className="text-xs text-neutral-400">Atual</p>
        </motion.div>
        <motion.div
          className="bg-neutral-800/30 rounded-lg p-3 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-2xl font-bold text-green-500">{metrics.peak}</p>
          <p className="text-xs text-neutral-400">Pico</p>
        </motion.div>
        <motion.div
          className="bg-neutral-800/30 rounded-lg p-3 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-2xl font-bold text-purple-500">{metrics.average}</p>
          <p className="text-xs text-neutral-400">Média</p>
        </motion.div>
      </div>

      {/* Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorEmployees" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            
            <XAxis
              dataKey="hour"
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            
            <YAxis
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Areas */}
            <Area
              type="monotone"
              dataKey="total"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#colorTotal)"
              fillOpacity={selectedArea === 'total' ? 1 : 0.3}
            />
            
            <Area
              type="monotone"
              dataKey="customers"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorCustomers)"
              fillOpacity={selectedArea === 'customers' ? 1 : 0.3}
            />
            
            <Area
              type="monotone"
              dataKey="employees"
              stroke="#a855f7"
              strokeWidth={2}
              fill="url(#colorEmployees)"
              fillOpacity={selectedArea === 'employees' ? 1 : 0.3}
            />
            
            {/* Reference line for average */}
            <ReferenceLine 
              y={metrics.average} 
              stroke="#6b7280" 
              strokeDasharray="2 2" 
              label={{ value: "Média", position: "insideTopRight" }}
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <button
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200",
              selectedArea === 'total'
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
            )}
            onClick={() => setSelectedArea('total')}
          >
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-sm font-medium">Total</span>
          </button>
          
          <button
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200",
              selectedArea === 'customers'
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
            )}
            onClick={() => setSelectedArea('customers')}
          >
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-sm font-medium">Clientes</span>
          </button>
          
          <button
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200",
              selectedArea === 'employees'
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
            )}
            onClick={() => setSelectedArea('employees')}
          >
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className="text-sm font-medium">Funcionários</span>
          </button>
        </div>
      </div>
    </Card>
  )
}

// Loading Skeleton
export function FlowChartSkeleton({ className, height = 300 }: { className?: string, height?: number }) {
  return (
    <Card className={cn("p-6 bg-neutral-900/95 backdrop-blur-xl border-neutral-800/50", className)}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="h-6 w-32 bg-neutral-800 animate-pulse rounded mb-2" />
          <div className="h-4 w-24 bg-neutral-800 animate-pulse rounded" />
        </div>
        <div className="h-8 w-32 bg-neutral-800 animate-pulse rounded" />
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-neutral-800/30 rounded-lg p-3">
            <div className="h-8 w-12 bg-neutral-700 animate-pulse rounded mb-2 mx-auto" />
            <div className="h-3 w-16 bg-neutral-700 animate-pulse rounded mx-auto" />
          </div>
        ))}
      </div>
      
      <div className={`bg-neutral-800/20 animate-pulse rounded-lg`} style={{ height }} />
      
      <div className="flex items-center justify-center gap-6 mt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 bg-neutral-700 animate-pulse rounded-full" />
            <div className="h-4 w-16 bg-neutral-700 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </Card>
  )
}