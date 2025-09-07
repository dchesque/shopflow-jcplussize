'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, TrendingDown, Calendar, BarChart3, Target, Users, 
  ShoppingBag, Clock, DollarSign, ArrowRight, Eye, CheckCircle2,
  AlertTriangle, Activity, Percent, Calculator
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart, Area } from 'recharts'

interface PeriodData {
  period: string
  label: string
  startDate: string
  endDate: string
  metrics: {
    totalVisitors: number
    totalCustomers: number
    totalRevenue: number
    conversionRate: number
    averageTimeSpent: number
    averageTicketValue: number
    transactionCount: number
    peakHour: string
    topProductCategory: string
    bounceRate: number
    customerSatisfaction: number
    newCustomers: number
    returningCustomers: number
  }
  hourlyData: Array<{
    hour: string
    visitors: number
    sales: number
    revenue: number
  }>
  dailyData: Array<{
    day: string
    date: string
    visitors: number
    customers: number
    revenue: number
    conversion: number
  }>
}

interface ComparisonMetric {
  key: keyof PeriodData['metrics']
  label: string
  icon: any
  color: string
  format: 'number' | 'currency' | 'percentage' | 'time' | 'string'
  improvement: 'higher' | 'lower' | 'neutral'
}

interface StatisticalSignificance {
  isSignificant: boolean
  pValue: number
  confidenceLevel: number
  interpretation: string
}

interface PeriodComparisonProps {
  className?: string
  defaultPeriod1?: string
  defaultPeriod2?: string
  onPeriodChange?: (period1: string, period2: string) => void
}

export function PeriodComparison({ 
  className = '', 
  defaultPeriod1 = 'current_week',
  defaultPeriod2 = 'previous_week',
  onPeriodChange 
}: PeriodComparisonProps) {
  const [period1, setPeriod1] = useState(defaultPeriod1)
  const [period2, setPeriod2] = useState(defaultPeriod2)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'trends'>('overview')

  const periodOptions = [
    { value: 'current_week', label: 'Esta Semana' },
    { value: 'previous_week', label: 'Semana Passada' },
    { value: 'current_month', label: 'Este Mês' },
    { value: 'previous_month', label: 'Mês Passado' },
    { value: 'current_quarter', label: 'Este Trimestre' },
    { value: 'previous_quarter', label: 'Trimestre Passado' },
    { value: 'current_year', label: 'Este Ano' },
    { value: 'previous_year', label: 'Ano Passado' },
    { value: 'last_7_days', label: 'Últimos 7 Dias' },
    { value: 'last_30_days', label: 'Últimos 30 Dias' },
    { value: 'last_90_days', label: 'Últimos 90 Dias' },
  ]

  const comparisonMetrics: ComparisonMetric[] = [
    { key: 'totalVisitors', label: 'Total de Visitantes', icon: Users, color: '#3b82f6', format: 'number', improvement: 'higher' },
    { key: 'totalCustomers', label: 'Total de Clientes', icon: ShoppingBag, color: '#10b981', format: 'number', improvement: 'higher' },
    { key: 'totalRevenue', label: 'Receita Total', icon: DollarSign, color: '#8b5cf6', format: 'currency', improvement: 'higher' },
    { key: 'conversionRate', label: 'Taxa de Conversão', icon: Target, color: '#f59e0b', format: 'percentage', improvement: 'higher' },
    { key: 'averageTimeSpent', label: 'Tempo Médio', icon: Clock, color: '#ef4444', format: 'time', improvement: 'higher' },
    { key: 'averageTicketValue', label: 'Ticket Médio', icon: Calculator, color: '#06b6d4', format: 'currency', improvement: 'higher' },
    { key: 'newCustomers', label: 'Novos Clientes', icon: Eye, color: '#84cc16', format: 'number', improvement: 'higher' },
    { key: 'customerSatisfaction', label: 'Satisfação', icon: CheckCircle2, color: '#ec4899', format: 'percentage', improvement: 'higher' },
  ]

  // Mock data generator
  const generatePeriodData = (periodKey: string): PeriodData => {
    const baseValues = {
      current_week: { visitors: 1250, customers: 320, revenue: 45600, conversion: 25.6 },
      previous_week: { visitors: 1180, customers: 295, revenue: 42300, conversion: 25.0 },
      current_month: { visitors: 5200, customers: 1340, revenue: 189500, conversion: 25.8 },
      previous_month: { visitors: 4980, customers: 1205, revenue: 172400, conversion: 24.2 },
      last_7_days: { visitors: 1320, customers: 340, revenue: 48200, conversion: 25.8 },
      last_30_days: { visitors: 5450, customers: 1410, revenue: 195800, conversion: 25.9 }
    }

    const base = baseValues[periodKey as keyof typeof baseValues] || baseValues.current_week
    const variance = 0.1 // 10% variance for realism

    return {
      period: periodKey,
      label: periodOptions.find(p => p.value === periodKey)?.label || periodKey,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
      endDate: new Date().toLocaleDateString('pt-BR'),
      metrics: {
        totalVisitors: Math.round(base.visitors * (1 + (Math.random() - 0.5) * variance)),
        totalCustomers: Math.round(base.customers * (1 + (Math.random() - 0.5) * variance)),
        totalRevenue: Math.round(base.revenue * (1 + (Math.random() - 0.5) * variance)),
        conversionRate: Math.round(base.conversion * (1 + (Math.random() - 0.5) * variance * 0.5) * 10) / 10,
        averageTimeSpent: Math.round(25 + (Math.random() - 0.5) * 10),
        averageTicketValue: Math.round((base.revenue / base.customers) * (1 + (Math.random() - 0.5) * variance)),
        transactionCount: Math.round(base.customers * 1.2 * (1 + (Math.random() - 0.5) * variance)),
        peakHour: ['14:00', '15:00', '16:00', '19:00', '20:00'][Math.floor(Math.random() * 5)],
        topProductCategory: ['Eletrônicos', 'Roupas', 'Casa', 'Alimentação', 'Esportes'][Math.floor(Math.random() * 5)],
        bounceRate: Math.round(15 + Math.random() * 10),
        customerSatisfaction: Math.round(82 + Math.random() * 15),
        newCustomers: Math.round(base.customers * 0.4 * (1 + (Math.random() - 0.5) * variance)),
        returningCustomers: Math.round(base.customers * 0.6 * (1 + (Math.random() - 0.5) * variance))
      },
      hourlyData: Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        visitors: Math.round(base.visitors / 24 * (0.5 + Math.random())),
        sales: Math.round(base.customers / 24 * (0.3 + Math.random() * 0.7)),
        revenue: Math.round(base.revenue / 24 * (0.3 + Math.random() * 0.7))
      })),
      dailyData: Array.from({ length: 7 }, (_, i) => ({
        day: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i],
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        visitors: Math.round(base.visitors / 7 * (0.7 + Math.random() * 0.6)),
        customers: Math.round(base.customers / 7 * (0.7 + Math.random() * 0.6)),
        revenue: Math.round(base.revenue / 7 * (0.7 + Math.random() * 0.6)),
        conversion: Math.round(base.conversion * (0.8 + Math.random() * 0.4) * 10) / 10
      }))
    }
  }

  const [data1] = useState(() => generatePeriodData(period1))
  const [data2] = useState(() => generatePeriodData(period2))

  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100 * 10) / 10
  }

  const calculateStatisticalSignificance = (metric: string, value1: number, value2: number): StatisticalSignificance => {
    const sampleSize = 1000 // Simulated sample size
    const pooledStd = Math.sqrt((Math.pow(value1 * 0.1, 2) + Math.pow(value2 * 0.1, 2)) / 2)
    const tStat = Math.abs(value1 - value2) / (pooledStd * Math.sqrt(2 / sampleSize))
    const pValue = Math.max(0.001, 0.05 / (1 + tStat))
    const isSignificant = pValue < 0.05
    const confidenceLevel = Math.round((1 - pValue) * 100)

    return {
      isSignificant,
      pValue,
      confidenceLevel: Math.min(99, confidenceLevel),
      interpretation: isSignificant 
        ? `Diferença estatisticamente significativa (p < 0.05)`
        : `Diferença não é estatisticamente significativa`
    }
  }

  const formatValue = (value: number | string, format: ComparisonMetric['format']): string => {
    if (typeof value === 'string') return value
    
    switch (format) {
      case 'currency':
        return `R$ ${value.toLocaleString('pt-BR')}`
      case 'percentage':
        return `${value}%`
      case 'time':
        return `${value}min`
      case 'number':
        return value.toLocaleString('pt-BR')
      default:
        return value.toString()
    }
  }

  const getChangeColor = (change: number, improvement: ComparisonMetric['improvement']): string => {
    if (improvement === 'neutral') return 'text-muted-foreground'
    if (improvement === 'higher') {
      return change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-muted-foreground'
    } else {
      return change < 0 ? 'text-green-600' : change > 0 ? 'text-red-600' : 'text-muted-foreground'
    }
  }

  const getChangeIcon = (change: number, improvement: ComparisonMetric['improvement']) => {
    if (change === 0) return <Activity className="w-3 h-3" />
    if (improvement === 'higher') {
      return change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
    } else {
      return change < 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
    }
  }

  const handlePeriodChange = (newPeriod1?: string, newPeriod2?: string) => {
    const p1 = newPeriod1 || period1
    const p2 = newPeriod2 || period2
    if (newPeriod1) setPeriod1(p1)
    if (newPeriod2) setPeriod2(p2)
    onPeriodChange?.(p1, p2)
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Comparação de Períodos</h3>
            <p className="text-sm text-muted-foreground">
              Análise comparativa detalhada com significância estatística
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Visão Geral</SelectItem>
                <SelectItem value="detailed">Detalhado</SelectItem>
                <SelectItem value="trends">Tendências</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Period Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Período A</label>
            <Select value={period1} onValueChange={(value) => handlePeriodChange(value, undefined)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {data1.startDate} - {data1.endDate}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Período B</label>
            <Select value={period2} onValueChange={(value) => handlePeriodChange(undefined, value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {data2.startDate} - {data2.endDate}
            </p>
          </div>
        </div>

        {/* Comparison Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {comparisonMetrics.map((metric) => {
            const value1 = data1.metrics[metric.key]
            const value2 = data2.metrics[metric.key]
            const change = calculatePercentageChange(
              typeof value1 === 'number' ? value1 : 0,
              typeof value2 === 'number' ? value2 : 0
            )
            const significance = calculateStatisticalSignificance(metric.key, 
              typeof value1 === 'number' ? value1 : 0,
              typeof value2 === 'number' ? value2 : 0
            )
            const Icon = metric.icon

            return (
              <motion.div
                key={metric.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedMetric === metric.key 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedMetric(selectedMetric === metric.key ? null : metric.key)}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color: metric.color }} />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Período A</p>
                      <p className="text-sm font-semibold">{formatValue(value1, metric.format)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Período B</p>
                      <p className="text-sm font-semibold">{formatValue(value2, metric.format)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-1 ${getChangeColor(change, metric.improvement)}`}>
                      {getChangeIcon(change, metric.improvement)}
                      <span className="text-sm font-medium">
                        {change > 0 ? '+' : ''}{change}%
                      </span>
                    </div>
                    
                    {significance.isSignificant ? (
                      <Badge variant="default" className="text-xs">
                        Significativo
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        N.S.
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Detailed Metric View */}
        <AnimatePresence>
          {selectedMetric && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 p-4 bg-muted/30 rounded-lg"
            >
              {(() => {
                const metric = comparisonMetrics.find(m => m.key === selectedMetric)
                if (!metric) return null

                const value1 = data1.metrics[metric.key]
                const value2 = data2.metrics[metric.key]
                const change = calculatePercentageChange(
                  typeof value1 === 'number' ? value1 : 0,
                  typeof value2 === 'number' ? value2 : 0
                )
                const significance = calculateStatisticalSignificance(
                  metric.key,
                  typeof value1 === 'number' ? value1 : 0,
                  typeof value2 === 'number' ? value2 : 0
                )

                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <metric.icon className="w-6 h-6" style={{ color: metric.color }} />
                      <div>
                        <h4 className="text-lg font-semibold">{metric.label}</h4>
                        <p className="text-sm text-muted-foreground">Análise detalhada da métrica</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-background rounded-lg">
                        <h5 className="font-medium mb-2">Período A ({data1.label})</h5>
                        <p className="text-2xl font-bold" style={{ color: metric.color }}>
                          {formatValue(value1, metric.format)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {data1.startDate} - {data1.endDate}
                        </p>
                      </div>

                      <div className="p-4 bg-background rounded-lg">
                        <h5 className="font-medium mb-2">Período B ({data2.label})</h5>
                        <p className="text-2xl font-bold" style={{ color: metric.color }}>
                          {formatValue(value2, metric.format)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {data2.startDate} - {data2.endDate}
                        </p>
                      </div>

                      <div className="p-4 bg-background rounded-lg">
                        <h5 className="font-medium mb-2">Variação</h5>
                        <div className={`flex items-center gap-2 ${getChangeColor(change, metric.improvement)}`}>
                          {getChangeIcon(change, metric.improvement)}
                          <p className="text-2xl font-bold">
                            {change > 0 ? '+' : ''}{change}%
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Diferença absoluta: {formatValue(
                            typeof value1 === 'number' && typeof value2 === 'number' 
                              ? Math.abs(value1 - value2) 
                              : 0, 
                            metric.format
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-background rounded-lg">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Significância Estatística
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <div className="flex items-center gap-2 mt-1">
                            {significance.isSignificant ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            )}
                            <span className={significance.isSignificant ? 'text-green-600' : 'text-yellow-600'}>
                              {significance.isSignificant ? 'Significativo' : 'Não Significativo'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Nível de Confiança</p>
                          <p className="font-medium mt-1">{significance.confidenceLevel}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">p-value</p>
                          <p className="font-medium mt-1">{significance.pValue.toFixed(3)}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3 p-3 bg-muted/50 rounded">
                        {significance.interpretation}
                      </p>
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trend Analysis Charts */}
        {viewMode === 'trends' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Comparison */}
              <div className="space-y-4">
                <h4 className="font-medium">Comparação Diária - Visitantes</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data1.dailyData.map((day, i) => ({
                      ...day,
                      period2_visitors: data2.dailyData[i]?.visitors || 0
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          value.toLocaleString(), 
                          name === 'visitors' ? 'Período A' : 'Período B'
                        ]}
                      />
                      <Bar dataKey="visitors" fill="#3b82f6" name="visitors" />
                      <Bar dataKey="period2_visitors" fill="#10b981" name="period2_visitors" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Revenue Trend */}
              <div className="space-y-4">
                <h4 className="font-medium">Tendência de Receita</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data1.dailyData.map((day, i) => ({
                      ...day,
                      period2_revenue: data2.dailyData[i]?.revenue || 0
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          `R$ ${value.toLocaleString()}`, 
                          name === 'revenue' ? 'Período A' : 'Período B'
                        ]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        name="revenue"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="period2_revenue" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        name="period2_revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Hourly Analysis */}
            <div className="space-y-4">
              <h4 className="font-medium">Análise por Hora do Dia</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data1.hourlyData.map((hour, i) => ({
                    ...hour,
                    period2_visitors: data2.hourlyData[i]?.visitors || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        value.toLocaleString(), 
                        name === 'visitors' ? `Visitantes - ${data1.label}` : `Visitantes - ${data2.label}`
                      ]}
                    />
                    <Bar dataKey="visitors" fill="#3b82f6" name="visitors" />
                    <Bar dataKey="period2_visitors" fill="#10b981" name="period2_visitors" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}