'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, Crown, Heart, Star, TrendingUp, TrendingDown, 
  ShoppingBag, Clock, Target, DollarSign, Eye, UserCheck 
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts'

interface CustomerSegment {
  id: string
  name: string
  icon: any
  color: string
  description: string
  count: number
  percentage: number
  avgAge: number
  avgTimeSpent: number
  conversionRate: number
  avgPurchaseValue: number
  visitFrequency: number
  characteristics: string[]
  behaviorPatterns: {
    preferredTime: string
    favoriteZones: string[]
    shoppingStyle: string
    groupTendency: string
  }
  trends: {
    growth: number
    retention: number
    satisfaction: number
  }
  recommendations: string[]
}

interface SegmentMetrics {
  segment: string
  satisfaction: number
  loyalty: number
  engagement: number
  spending: number
  frequency: number
  retention: number
}

interface CustomerSegmentationProps {
  className?: string
  timeRange?: '7d' | '30d' | '90d'
  onTimeRangeChange?: (range: '7d' | '30d' | '90d') => void
}

export function CustomerSegmentation({ 
  className = '', 
  timeRange = '30d',
  onTimeRangeChange 
}: CustomerSegmentationProps) {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparison'>('overview')
  
  const generateCustomerSegments = (): CustomerSegment[] => [
    {
      id: 'vip',
      name: 'Clientes VIP',
      icon: Crown,
      color: '#eab308',
      description: 'Clientes premium com alto valor e frequência',
      count: 127,
      percentage: 15.2,
      avgAge: 38,
      avgTimeSpent: 45,
      conversionRate: 92,
      avgPurchaseValue: 480,
      visitFrequency: 2.3,
      characteristics: [
        'Alto poder aquisitivo',
        'Compras frequentes',
        'Fidelidade elevada',
        'Influenciadores',
        'Feedback ativo'
      ],
      behaviorPatterns: {
        preferredTime: 'Manhã e início da tarde',
        favoriteZones: ['Premium', 'Eletrônicos', 'Roupas'],
        shoppingStyle: 'Planejado e específico',
        groupTendency: 'Individual ou casal'
      },
      trends: {
        growth: 12,
        retention: 95,
        satisfaction: 88
      },
      recommendations: [
        'Programa de fidelidade exclusivo',
        'Atendimento personalizado',
        'Preview de novos produtos',
        'Eventos VIP',
        'Desconto por volume'
      ]
    },
    {
      id: 'loyal',
      name: 'Fiéis',
      icon: Heart,
      color: '#ef4444',
      description: 'Clientes regulares com boa frequência',
      count: 342,
      percentage: 40.8,
      avgAge: 32,
      avgTimeSpent: 28,
      conversionRate: 73,
      avgPurchaseValue: 185,
      visitFrequency: 1.8,
      characteristics: [
        'Visitas regulares',
        'Preferências definidas',
        'Sensível a promoções',
        'Recomendam a outros',
        'Engajamento médio'
      ],
      behaviorPatterns: {
        preferredTime: 'Fins de semana',
        favoriteZones: ['Roupas', 'Casa', 'Alimentação'],
        shoppingStyle: 'Misto: planejado e impulso',
        groupTendency: 'Família ou amigos'
      },
      trends: {
        growth: 8,
        retention: 78,
        satisfaction: 76
      },
      recommendations: [
        'Programa de pontos',
        'Ofertas personalizadas',
        'Newsletter com novidades',
        'Cashback em compras',
        'Upgrade para VIP'
      ]
    },
    {
      id: 'potential',
      name: 'Potenciais',
      icon: Star,
      color: '#3b82f6',
      description: 'Novos clientes com bom potencial',
      count: 189,
      percentage: 22.6,
      avgAge: 28,
      avgTimeSpent: 22,
      conversionRate: 58,
      avgPurchaseValue: 120,
      visitFrequency: 0.8,
      characteristics: [
        'Primeiras visitas',
        'Explorando opções',
        'Comparando preços',
        'Curiosos e indecisos',
        'Influenciáveis'
      ],
      behaviorPatterns: {
        preferredTime: 'Tarde e noite',
        favoriteZones: ['Entrada', 'Promoções', 'Diversos'],
        shoppingStyle: 'Exploratório',
        groupTendency: 'Individual ou amigos'
      },
      trends: {
        growth: 25,
        retention: 45,
        satisfaction: 65
      },
      recommendations: [
        'Tour guiado da loja',
        'Ofertas de boas-vindas',
        'Cupons de desconto',
        'Atendimento proativo',
        'Programa de onboarding'
      ]
    },
    {
      id: 'browsers',
      name: 'Navegadores',
      icon: Eye,
      color: '#8b5cf6',
      description: 'Visitantes que exploram sem comprar',
      count: 156,
      percentage: 18.6,
      avgAge: 25,
      avgTimeSpent: 35,
      conversionRate: 12,
      avgPurchaseValue: 0,
      visitFrequency: 1.2,
      characteristics: [
        'Alto tempo de permanência',
        'Baixa conversão',
        'Pesquisam muito',
        'Comparação de preços',
        'Indecisos'
      ],
      behaviorPatterns: {
        preferredTime: 'Qualquer horário',
        favoriteZones: ['Todos os setores'],
        shoppingStyle: 'Window shopping',
        groupTendency: 'Individual'
      },
      trends: {
        growth: -5,
        retention: 25,
        satisfaction: 55
      },
      recommendations: [
        'Campanhas de conversão',
        'Demonstrações de produto',
        'Ofertas limitadas',
        'Consultoria gratuita',
        'Retargeting online'
      ]
    },
    {
      id: 'occasional',
      name: 'Ocasionais',
      icon: UserCheck,
      color: '#10b981',
      description: 'Clientes esporádicos mas convertem',
      count: 25,
      percentage: 3.0,
      avgAge: 42,
      avgTimeSpent: 18,
      conversionRate: 85,
      avgPurchaseValue: 320,
      visitFrequency: 0.3,
      characteristics: [
        'Visitas raras',
        'Alta conversão',
        'Compras específicas',
        'Decisão rápida',
        'Objetivos claros'
      ],
      behaviorPatterns: {
        preferredTime: 'Dias úteis',
        favoriteZones: ['Específicas por necessidade'],
        shoppingStyle: 'Direto ao ponto',
        groupTendency: 'Individual'
      },
      trends: {
        growth: 3,
        retention: 15,
        satisfaction: 82
      },
      recommendations: [
        'Lembretes personalizados',
        'Ofertas sazonais',
        'Lista de desejos',
        'Notificações de estoque',
        'Agendamento de visitas'
      ]
    }
  ]
  
  const generateSegmentMetrics = (): SegmentMetrics[] => [
    { segment: 'VIP', satisfaction: 88, loyalty: 95, engagement: 92, spending: 95, frequency: 90, retention: 95 },
    { segment: 'Fiéis', satisfaction: 76, loyalty: 78, engagement: 75, spending: 65, frequency: 80, retention: 78 },
    { segment: 'Potenciais', satisfaction: 65, loyalty: 45, engagement: 68, spending: 45, frequency: 35, retention: 45 },
    { segment: 'Navegadores', satisfaction: 55, loyalty: 25, engagement: 80, spending: 5, frequency: 50, retention: 25 },
    { segment: 'Ocasionais', satisfaction: 82, loyalty: 15, engagement: 40, spending: 85, frequency: 15, retention: 15 }
  ]
  
  const [segments] = useState(generateCustomerSegments())
  const [segmentMetrics] = useState(generateSegmentMetrics())
  
  const totalCustomers = segments.reduce((sum, s) => sum + s.count, 0)
  const avgConversion = segments.reduce((sum, s) => sum + s.conversionRate * s.percentage / 100, 0)
  const avgValue = segments.reduce((sum, s) => sum + s.avgPurchaseValue * s.percentage / 100, 0)
  
  const revenueData = segments.map(segment => ({
    name: segment.name,
    revenue: Math.round(segment.count * segment.avgPurchaseValue * (segment.conversionRate / 100)),
    customers: segment.count,
    conversion: segment.conversionRate
  }))

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Segmentação de Clientes</h3>
            <p className="text-sm text-muted-foreground">
              Análise inteligente de perfis e comportamentos identificados pela IA
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Visão Geral</SelectItem>
                <SelectItem value="detailed">Detalhado</SelectItem>
                <SelectItem value="comparison">Comparação</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={timeRange} onValueChange={(value: any) => onTimeRangeChange?.(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Overall Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-blue-600 text-sm font-medium">Total de Clientes</p>
                <p className="text-2xl font-bold text-blue-700">{totalCustomers.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-green-600 text-sm font-medium">Conversão Média</p>
                <p className="text-2xl font-bold text-green-700">{Math.round(avgConversion)}%</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-purple-500" />
              <div>
                <p className="text-purple-600 text-sm font-medium">Ticket Médio</p>
                <p className="text-2xl font-bold text-purple-700">R$ {Math.round(avgValue)}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-orange-500" />
              <div>
                <p className="text-orange-600 text-sm font-medium">Segmento Top</p>
                <p className="text-2xl font-bold text-orange-700">VIP</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Segment Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {segments.map((segment) => {
            const Icon = segment.icon
            const isSelected = selectedSegment === segment.id
            
            return (
              <motion.div
                key={segment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedSegment(isSelected ? null : segment.id)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon className="w-6 h-6" style={{ color: segment.color }} />
                  <div>
                    <h4 className="font-semibold text-sm">{segment.name}</h4>
                    <p className="text-xs text-muted-foreground">{segment.percentage}% do total</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Clientes:</span>
                    <span className="font-medium">{segment.count}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Conversão:</span>
                    <span className="font-medium">{segment.conversionRate}%</span>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Performance:</span>
                      <span className="font-medium">{segment.conversionRate}%</span>
                    </div>
                    <Progress 
                      value={segment.conversionRate} 
                      className="h-2"
                    />
                  </div>
                  
                  {segment.avgPurchaseValue > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ticket:</span>
                      <span className="font-medium">R$ {segment.avgPurchaseValue}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1 pt-2">
                    {segment.trends.growth > 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    <span className={`text-xs ${
                      segment.trends.growth > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {segment.trends.growth > 0 ? '+' : ''}{segment.trends.growth}% crescimento
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {/* Detailed View */}
        <AnimatePresence>
          {selectedSegment && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 p-6 bg-muted/30 rounded-lg"
            >
              {(() => {
                const segment = segments.find(s => s.id === selectedSegment)
                if (!segment) return null
                
                return (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <segment.icon className="w-8 h-8" style={{ color: segment.color }} />
                      <div>
                        <h3 className="text-xl font-semibold">{segment.name}</h3>
                        <p className="text-muted-foreground">{segment.description}</p>
                      </div>
                    </div>
                    
                    {/* Detailed Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-background rounded-lg">
                        <Users className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-2xl font-bold">{segment.count}</p>
                        <p className="text-sm text-muted-foreground">Clientes</p>
                      </div>
                      
                      <div className="text-center p-3 bg-background rounded-lg">
                        <Clock className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-2xl font-bold">{segment.avgTimeSpent}min</p>
                        <p className="text-sm text-muted-foreground">Tempo Médio</p>
                      </div>
                      
                      <div className="text-center p-3 bg-background rounded-lg">
                        <Target className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-2xl font-bold">{segment.conversionRate}%</p>
                        <p className="text-sm text-muted-foreground">Conversão</p>
                      </div>
                      
                      <div className="text-center p-3 bg-background rounded-lg">
                        <DollarSign className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-2xl font-bold">R$ {segment.avgPurchaseValue}</p>
                        <p className="text-sm text-muted-foreground">Ticket Médio</p>
                      </div>
                    </div>
                    
                    {/* Characteristics and Behavior */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Características</h4>
                        <div className="space-y-2">
                          {segment.characteristics.map((char, index) => (
                            <Badge key={index} variant="secondary" className="mr-2 mb-2">
                              {char}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Padrões de Comportamento</h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Horário preferido: </span>
                            <span className="font-medium">{segment.behaviorPatterns.preferredTime}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Estilo de compra: </span>
                            <span className="font-medium">{segment.behaviorPatterns.shoppingStyle}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tendência de grupo: </span>
                            <span className="font-medium">{segment.behaviorPatterns.groupTendency}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Zonas favoritas: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {segment.behaviorPatterns.favoriteZones.map((zone, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {zone}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recommendations */}
                    <div>
                      <h4 className="font-medium mb-3">Recomendações de Estratégia</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {segment.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-background rounded-lg">
                            <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: segment.color }}></div>
                            <span className="text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Charts */}
        {viewMode === 'comparison' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Segment */}
            <div className="space-y-4">
              <h4 className="font-medium">Receita por Segmento</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`R$ ${value.toLocaleString()}`, 'Receita']} />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Segment Performance Radar */}
            <div className="space-y-4">
              <h4 className="font-medium">Performance por Dimensão</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={segmentMetrics}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="segment" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      name="Satisfação"
                      dataKey="satisfaction"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.1}
                    />
                    <Radar
                      name="Fidelidade"
                      dataKey="loyalty"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.1}
                    />
                    <Radar
                      name="Gastos"
                      dataKey="spending"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.1}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}