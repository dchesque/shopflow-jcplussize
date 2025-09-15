'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Clock, UserCheck, TrendingUp,
  Calendar, PieChart, BarChart3, RefreshCw,
  Filter, Download, Target, Crown
} from 'lucide-react'
import {
  fetchCustomerSegments,
  type CustomerSegment
} from '@/lib/api/supabase-analytics'

// Temporary inline components for Docker build
const Card = ({ children, className = "", ...props }: any) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props}>
    {children}
  </div>
)

const Badge = ({ children, variant = "default", className = "" }: any) => (
  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}>
    {children}
  </div>
)

const Button = ({ children, variant = "default", size = "default", className = "", disabled = false, onClick, ...props }: any) => (
  <button
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${className}`}
    disabled={disabled}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
)

const ProgressBar = ({ value, max, className = "", color = "bg-blue-500" }: any) => {
  const percentage = Math.min((value / max) * 100, 100)
  return (
    <div className={`w-full h-2 bg-neutral-700 rounded-full ${className}`}>
      <div
        className={`h-2 ${color} rounded-full transition-all duration-300`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  )
}

export default function SegmentationPage() {
  const [loading, setLoading] = useState(false)
  const [segments, setSegments] = useState<CustomerSegment[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [totalVisitors, setTotalVisitors] = useState(0)

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  // Função para carregar dados de segmentação
  const loadSegmentationData = async () => {
    setLoading(true)
    try {
      const segmentData = await fetchCustomerSegments()
      setSegments(segmentData)
      setTotalVisitors(segmentData.reduce((sum, segment) => sum + segment.size, 0))
    } catch (error) {
      console.error('Error loading segmentation data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadSegmentationData()

    // Atualizar a cada 30 segundos
    const interval = setInterval(loadSegmentationData, 30000)

    return () => clearInterval(interval)
  }, [selectedPeriod])

  // Calcular segmentos por horário baseado em dados reais
  const timeSegments = [
    {
      name: 'Manhã',
      period: '6h-12h',
      percentage: segments.filter(s => s.time_preference === 'morning').reduce((sum, s) => sum + s.percentage, 0),
      color: 'text-blue-500'
    },
    {
      name: 'Tarde',
      period: '12h-18h',
      percentage: segments.filter(s => s.time_preference === 'afternoon').reduce((sum, s) => sum + s.percentage, 0),
      color: 'text-green-500'
    },
    {
      name: 'Noite',
      period: '18h-22h',
      percentage: segments.filter(s => s.time_preference === 'evening').reduce((sum, s) => sum + s.percentage, 0),
      color: 'text-yellow-500'
    },
    {
      name: 'Madrugada',
      period: '22h-6h',
      percentage: 100 - segments.filter(s => s.time_preference).reduce((sum, s) => sum + s.percentage, 0),
      color: 'text-red-500'
    }
  ]

  // Cores para diferentes tipos de segmentos
  const getSegmentColor = (segment: CustomerSegment) => {
    if (segment.behavior_type === 'premium') return 'bg-purple-500'
    if (segment.behavior_type === 'loyal') return 'bg-green-500'
    if (segment.behavior_type === 'regular') return 'bg-blue-500'
    if (segment.behavior_type === 'occasional') return 'bg-yellow-500'
    if (segment.behavior_type === 'new') return 'bg-orange-500'
    return 'bg-gray-500'
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-6"
    >
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Segmentação de Público</h1>
              <p className="text-muted-foreground">
                Análise detalhada de segmentos de visitantes baseada em dados reais do Supabase
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadSegmentationData}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Visitantes</p>
                <p className="text-lg font-semibold">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    totalVisitors.toLocaleString()
                  )}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <PieChart className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Segmentos Ativos</p>
                <p className="text-lg font-semibold">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    segments.length
                  )}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Maior Segmento</p>
                <p className="text-lg font-semibold">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    segments.length > 0 ? `${segments[0]?.percentage || 0}%` : '0%'
                  )}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio VIP</p>
                <p className="text-lg font-semibold">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    `R$ ${segments.find(s => s.behavior_type === 'premium')?.avg_purchase_value || 0}`
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Segmentação por Comportamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Segmentação por Comportamento</h3>
            <Badge variant="outline">Dados Reais</Badge>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              segments.map((segment) => (
                <div key={segment.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{segment.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {segment.size} pessoas
                      </Badge>
                    </div>
                    <span className="text-sm font-semibold">{segment.percentage}%</span>
                  </div>
                  <ProgressBar
                    value={segment.percentage}
                    max={100}
                    color={getSegmentColor(segment)}
                  />
                  <p className="text-xs text-muted-foreground">{segment.description}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Tempo médio: {segment.avg_visit_duration}min</span>
                    <span>Ticket médio: R$ {segment.avg_purchase_value}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Análise Temporal</h3>
            <Badge variant="outline">Por Horário</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {timeSegments.map((timeSegment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <p className={`text-2xl font-bold ${timeSegment.color}`}>
                  {timeSegment.name}
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  {timeSegment.period}
                </p>
                <p className="font-semibold">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    `${timeSegment.percentage.toFixed(1)}% do tráfego`
                  )}
                </p>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Insights e Recomendações */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Insights e Recomendações</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded">
            <h4 className="text-green-600 font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Oportunidade de Crescimento
            </h4>
            <p className="text-sm text-muted-foreground">
              {segments.length > 0 && segments[0]?.behavior_type === 'new'
                ? 'Alto número de novos visitantes - focar em conversão'
                : 'Segmento premium em crescimento - expandir ofertas VIP'
              }
            </p>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded">
            <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Otimização de Horário
            </h4>
            <p className="text-sm text-muted-foreground">
              {timeSegments.find(t => t.percentage === Math.max(...timeSegments.map(ts => ts.percentage)))?.name === 'Tarde'
                ? 'Pico de tarde confirmado - manter equipe reforçada'
                : 'Padrão de tráfego alterado - revisar escalas'
              }
            </p>
          </div>

          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded">
            <h4 className="text-purple-600 font-semibold mb-2 flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Personalização
            </h4>
            <p className="text-sm text-muted-foreground">
              {segments.filter(s => s.behavior_type === 'loyal').length > 0
                ? 'Implementar programa de fidelidade para visitantes frequentes'
                : 'Criar estratégias de retenção baseadas em comportamento'
              }
            </p>
          </div>
        </div>
      </Card>

      {/* Footer Info */}
      <Card className="p-4 bg-muted/30">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Dados atualizados em tempo real via Supabase</span>
            <Badge variant="outline" className="gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Online
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <span>Última atualização: {new Date().toLocaleTimeString()}</span>
            <Badge variant="default">
              Integrado com Supabase
            </Badge>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}