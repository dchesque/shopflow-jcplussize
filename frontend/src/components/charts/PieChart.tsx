'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface PieData {
  name: string
  value: number
  color: string
  percentage?: number
}

interface PieChartProps {
  data: PieData[]
  title?: string
  subtitle?: string
  showLegend?: boolean
  showLabels?: boolean
  className?: string
  height?: number
}

export function PieChart({
  data,
  title = "Distribuição",
  subtitle = "Por categoria",
  showLegend = true,
  showLabels = true,
  className,
  height = 300
}: PieChartProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  
  // Calculate percentages
  const dataWithPercentages = React.useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    return data.map(item => ({
      ...item,
      percentage: Math.round((item.value / total) * 100)
    }))
  }, [data])

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null

    const data = payload[0].payload
    return (
      <div className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-800/50 rounded-lg p-3 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.color }}
          />
          <span className="text-sm font-medium text-white">{data.name}</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-xs text-neutral-400">Valor:</span>
            <span className="text-xs text-white font-medium">{data.value}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-xs text-neutral-400">Percentual:</span>
            <span className="text-xs text-white font-medium">{data.percentage}%</span>
          </div>
        </div>
      </div>
    )
  }

  // Custom Label
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Hide labels for slices < 5%
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="500"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(null)
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
      </div>

      <div className="flex items-center justify-between">
        {/* Chart */}
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={height}>
            <RechartsPieChart>
              <Pie
                data={dataWithPercentages}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={showLabels ? renderCustomLabel : false}
                outerRadius={Math.min(height * 0.35, 100)}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
              >
                {dataWithPercentages.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={activeIndex === index ? '#ffffff' : 'transparent'}
                    strokeWidth={activeIndex === index ? 2 : 0}
                    style={{
                      filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                      transformOrigin: 'center',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="ml-6 space-y-3 min-w-[140px]">
            {dataWithPercentages.map((entry, index) => (
              <motion.div
                key={entry.name}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-all duration-200 cursor-pointer",
                  activeIndex === index
                    ? "bg-neutral-800/50 scale-105"
                    : "hover:bg-neutral-800/30"
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {entry.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-neutral-400">{entry.value}</span>
                    <span className="text-xs text-neutral-500">•</span>
                    <span className="text-xs font-medium" style={{ color: entry.color }}>
                      {entry.percentage}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-neutral-800/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-400">Total:</span>
          <span className="text-white font-medium">
            {dataWithPercentages.reduce((sum, item) => sum + item.value, 0)}
          </span>
        </div>
      </div>
    </Card>
  )
}

// Loading Skeleton
export function PieChartSkeleton({ className, height = 300 }: { className?: string, height?: number }) {
  return (
    <Card className={cn("p-6 bg-neutral-900/95 backdrop-blur-xl border-neutral-800/50", className)}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="h-6 w-24 bg-neutral-800 animate-pulse rounded mb-2" />
          <div className="h-4 w-20 bg-neutral-800 animate-pulse rounded" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div 
            className="bg-neutral-800/20 animate-pulse rounded-full mx-auto"
            style={{ 
              width: Math.min(height * 0.7, 200), 
              height: Math.min(height * 0.7, 200) 
            }}
          />
        </div>

        <div className="ml-6 space-y-3 min-w-[140px]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-3 h-3 bg-neutral-700 animate-pulse rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-20 bg-neutral-700 animate-pulse rounded mb-1" />
                <div className="h-3 w-16 bg-neutral-700 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-neutral-800/50">
        <div className="flex items-center justify-between">
          <div className="h-4 w-12 bg-neutral-700 animate-pulse rounded" />
          <div className="h-4 w-16 bg-neutral-700 animate-pulse rounded" />
        </div>
      </div>
    </Card>
  )
}