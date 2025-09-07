'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, TrendingDown, Target, Star, Award, BarChart3, 
  Building2, Users, ShoppingBag, Clock, DollarSign, Eye,
  CheckCircle2, AlertTriangle, Trophy, Flag, Zap, Crown,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ComposedChart, Line, Area } from 'recharts'

interface BenchmarkMetric {
  key: string
  label: string
  icon: any
  color: string
  unit: string
  currentValue: number
  industryAverage: number
  topPerformer: number
  goal: number
  category: 'traffic' | 'conversion' | 'revenue' | 'experience' | 'operational'
  improvement: 'higher' | 'lower'
  description: string
  insights: string[]
  recommendations: string[]
}

interface IndustryBenchmark {
  segment: string
  storeSize: string
  location: string
  metrics: {
    conversionRate: number
    avgTimeSpent: number
    avgTicketValue: number
    customerSatisfaction: number
    footTraffic: number
    peakHourConversion: number
    returnCustomerRate: number
    salesPerSqFt: number
  }
}

interface PerformanceScore {
  overall: number
  traffic: number
  conversion: number
  revenue: number
  experience: number
  operational: number
}

interface StoreBenchmarksProps {
  className?: string
  storeType?: 'retail' | 'fashion' | 'electronics' | 'food' | 'department'
  storeSize?: 'small' | 'medium' | 'large'
  location?: 'mall' | 'street' | 'shopping_center' | 'standalone'
}

export function StoreBenchmarks({ 
  className = '', 
  storeType = 'retail',
  storeSize = 'medium',
  location = 'mall'
}: StoreBenchmarksProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'goals'>('overview')
  const [compareSegment, setCompareSegment] = useState<string>('similar_stores')

  const benchmarkMetrics: BenchmarkMetric[] = [
    {
      key: 'conversion_rate',
      label: 'Taxa de Conversão',
      icon: Target,
      color: '#10b981',
      unit: '%',
      currentValue: 25.8,
      industryAverage: 23.5,
      topPerformer: 35.2,
      goal: 30.0,
      category: 'conversion',
      improvement: 'higher',
      description: 'Percentual de visitantes que realizam compra',
      insights: [
        'Sua loja está 9.8% acima da média do setor',
        'Top performers alcançam até 35.2%',
        'Meta de 30% é realista e alcançável'
      ],
      recommendations: [
        'Melhorar layout de produtos em destaque',
        'Implementar estratégias de cross-selling',
        'Otimizar processo de checkout',
        'Treinar equipe em técnicas de venda'
      ]
    },
    {
      key: 'avg_time_spent',
      label: 'Tempo Médio de Permanência',
      icon: Clock,
      color: '#f59e0b',
      unit: 'min',
      currentValue: 28.5,
      industryAverage: 32.0,
      topPerformer: 45.0,
      goal: 35.0,
      category: 'experience',
      improvement: 'higher',
      description: 'Tempo médio que os clientes passam na loja',
      insights: [
        'Tempo abaixo da média indica oportunidade de engajamento',
        'Clientes que ficam mais tempo convertem 40% mais',
        'Layout pode estar dificultando navegação'
      ],
      recommendations: [
        'Revisar layout para criar fluxo mais natural',
        'Implementar áreas de descanso/experiência',
        'Adicionar elementos interativos',
        'Melhorar sinalização e wayfinding'
      ]
    },
    {
      key: 'avg_ticket_value',
      label: 'Ticket Médio',
      icon: DollarSign,
      color: '#8b5cf6',
      unit: 'R$',
      currentValue: 185.40,
      industryAverage: 170.00,
      topPerformer: 280.50,
      goal: 220.00,
      category: 'revenue',
      improvement: 'higher',
      description: 'Valor médio gasto por cliente na compra',
      insights: [
        'Ticket 9.1% acima da média do mercado',
        'Potencial para crescimento de 51% (vs. top performer)',
        'Meta de R$ 220 representa crescimento sustentável'
      ],
      recommendations: [
        'Implementar estratégias de upselling',
        'Criar bundles de produtos complementares',
        'Programa de fidelidade com incentivos',
        'Treinamento em vendas consultivas'
      ]
    },
    {
      key: 'customer_satisfaction',
      label: 'Satisfação do Cliente',
      icon: Star,
      color: '#ec4899',
      unit: '%',
      currentValue: 87.2,
      industryAverage: 82.5,
      topPerformer: 95.8,
      goal: 90.0,
      category: 'experience',
      improvement: 'higher',
      description: 'Índice de satisfação baseado em feedback dos clientes',
      insights: [
        'Satisfação 5.7% acima da média do setor',
        'Excelente reputação, mas ainda há margem para melhoria',
        'Meta de 90% é conservadora e alcançável'
      ],
      recommendations: [
        'Implementar programa de feedback contínuo',
        'Melhorar treinamento de atendimento ao cliente',
        'Resolver pontos de fricção identificados',
        'Personalizar experiência por perfil de cliente'
      ]
    },
    {
      key: 'foot_traffic',
      label: 'Tráfego de Pedestres',
      icon: Users,
      color: '#3b82f6',
      unit: 'visitantes/dia',
      currentValue: 450,
      industryAverage: 380,
      topPerformer: 650,
      goal: 500,
      category: 'traffic',
      improvement: 'higher',
      description: 'Número médio de visitantes únicos por dia',
      insights: [
        'Tráfego 18.4% acima da média do setor',
        'Localização privilegiada gerando bom fluxo',
        'Potencial para 44% mais tráfego (vs. top performer)'
      ],
      recommendations: [
        'Otimizar vitrine e fachada para atrair mais atenção',
        'Campanhas de marketing local direcionadas',
        'Parcerias com lojas vizinhas',
        'Eventos e promoções para gerar buzz'
      ]
    },
    {
      key: 'return_customer_rate',
      label: 'Taxa de Retorno',
      icon: ArrowUp,
      color: '#06b6d4',
      unit: '%',
      currentValue: 42.8,
      industryAverage: 38.5,
      topPerformer: 58.0,
      goal: 50.0,
      category: 'conversion',
      improvement: 'higher',
      description: 'Percentual de clientes que retornam para novas compras',
      insights: [
        'Fidelidade 11.2% acima da média',
        'Base de clientes leais sólida',
        'Oportunidade de 35% de crescimento vs. top performer'
      ],
      recommendations: [
        'Programa de fidelidade robusto',
        'Comunicação pós-venda eficaz',
        'Ofertas personalizadas baseadas em histórico',
        'Experiências exclusivas para clientes VIP'
      ]
    }
  ]

  const industryBenchmarks: IndustryBenchmark[] = [
    {
      segment: 'similar_stores',
      storeSize: 'medium',
      location: 'mall',
      metrics: {
        conversionRate: 23.5,
        avgTimeSpent: 32.0,
        avgTicketValue: 170.00,
        customerSatisfaction: 82.5,
        footTraffic: 380,
        peakHourConversion: 28.0,
        returnCustomerRate: 38.5,
        salesPerSqFt: 450
      }
    },
    {
      segment: 'top_performers',
      storeSize: 'medium',
      location: 'mall',
      metrics: {
        conversionRate: 35.2,
        avgTimeSpent: 45.0,
        avgTicketValue: 280.50,
        customerSatisfaction: 95.8,
        footTraffic: 650,
        peakHourConversion: 42.5,
        returnCustomerRate: 58.0,
        salesPerSqFt: 720
      }
    },
    {
      segment: 'market_leaders',
      storeSize: 'large',
      location: 'mall',
      metrics: {
        conversionRate: 38.8,
        avgTimeSpent: 52.0,
        avgTicketValue: 320.75,
        customerSatisfaction: 97.2,
        footTraffic: 850,
        peakHourConversion: 45.8,
        returnCustomerRate: 65.2,
        salesPerSqFt: 920
      }
    }
  ]

  const calculatePerformanceScore = (): PerformanceScore => {
    const trafficMetrics = benchmarkMetrics.filter(m => m.category === 'traffic')
    const conversionMetrics = benchmarkMetrics.filter(m => m.category === 'conversion')
    const revenueMetrics = benchmarkMetrics.filter(m => m.category === 'revenue')
    const experienceMetrics = benchmarkMetrics.filter(m => m.category === 'experience')
    const operationalMetrics = benchmarkMetrics.filter(m => m.category === 'operational')

    const calculateCategoryScore = (metrics: BenchmarkMetric[]): number => {
      if (metrics.length === 0) return 75 // Default score for empty categories
      
      const scores = metrics.map(metric => {
        const ratio = metric.currentValue / metric.industryAverage
        return Math.min(100, Math.max(0, ratio * 75)) // Scale to 0-100, with industry average = 75
      })
      
      return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    }

    const traffic = calculateCategoryScore(trafficMetrics)
    const conversion = calculateCategoryScore(conversionMetrics)
    const revenue = calculateCategoryScore(revenueMetrics)
    const experience = calculateCategoryScore(experienceMetrics)
    const operational = calculateCategoryScore(operationalMetrics)

    const overall = Math.round((traffic + conversion + revenue + experience + operational) / 5)

    return { overall, traffic, conversion, revenue, experience, operational }
  }

  const [performanceScore] = useState(calculatePerformanceScore())

  const getPerformanceColor = (score: number): string => {
    if (score >= 85) return '#10b981' // green
    if (score >= 70) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  const getPerformanceBadge = (score: number): { label: string; variant: any } => {
    if (score >= 90) return { label: 'Excepcional', variant: 'default' }
    if (score >= 80) return { label: 'Excelente', variant: 'default' }
    if (score >= 70) return { label: 'Bom', variant: 'secondary' }
    if (score >= 60) return { label: 'Regular', variant: 'outline' }
    return { label: 'Precisa Melhorar', variant: 'destructive' }
  }

  const getComparisonIcon = (current: number, benchmark: number, improvement: 'higher' | 'lower') => {
    const isAbove = current > benchmark
    const isBelow = current < benchmark
    
    if (improvement === 'higher') {
      if (isAbove) return <ArrowUp className="w-4 h-4 text-green-500" />
      if (isBelow) return <ArrowDown className="w-4 h-4 text-red-500" />
    } else {
      if (isBelow) return <ArrowUp className="w-4 h-4 text-green-500" />
      if (isAbove) return <ArrowDown className="w-4 h-4 text-red-500" />
    }
    
    return <Minus className="w-4 h-4 text-muted-foreground" />
  }

  const formatMetricValue = (value: number, unit: string): string => {
    if (unit === 'R$') return `R$ ${value.toFixed(2)}`
    if (unit === '%') return `${value.toFixed(1)}%`
    if (unit === 'min') return `${value.toFixed(1)}min`
    return value.toLocaleString()
  }

  const radarData = [
    { category: 'Tráfego', score: performanceScore.traffic, maxScore: 100 },
    { category: 'Conversão', score: performanceScore.conversion, maxScore: 100 },
    { category: 'Receita', score: performanceScore.revenue, maxScore: 100 },
    { category: 'Experiência', score: performanceScore.experience, maxScore: 100 },
    { category: 'Operacional', score: performanceScore.operational, maxScore: 100 }
  ]

  const performanceBadge = getPerformanceBadge(performanceScore.overall)

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Benchmarks da Loja</h3>
            <p className="text-sm text-muted-foreground">
              Comparação com médias da indústria e melhores práticas
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={compareSegment} onValueChange={setCompareSegment}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="similar_stores">Lojas Similares</SelectItem>
                <SelectItem value="top_performers">Top Performers</SelectItem>
                <SelectItem value="market_leaders">Líderes de Mercado</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Resumo</SelectItem>
                <SelectItem value="detailed">Detalhado</SelectItem>
                <SelectItem value="goals">Metas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Performance Score Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overall Score */}
          <div className="space-y-4">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Trophy className="w-8 h-8" style={{ color: getPerformanceColor(performanceScore.overall) }} />
                <div>
                  <p className="text-3xl font-bold" style={{ color: getPerformanceColor(performanceScore.overall) }}>
                    {performanceScore.overall}
                  </p>
                  <p className="text-sm text-muted-foreground">Score Geral</p>
                </div>
              </div>
              <Badge variant={performanceBadge.variant} className="text-sm px-3 py-1">
                {performanceBadge.label}
              </Badge>
            </div>

            {/* Category Scores */}
            <div className="space-y-3">
              {[
                { label: 'Tráfego', score: performanceScore.traffic, icon: Users },
                { label: 'Conversão', score: performanceScore.conversion, icon: Target },
                { label: 'Receita', score: performanceScore.revenue, icon: DollarSign },
                { label: 'Experiência', score: performanceScore.experience, icon: Star },
                { label: 'Operacional', score: performanceScore.operational, icon: Building2 }
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    <span className="text-sm font-bold w-8">{item.score}</span>
                    <Progress value={item.score} className="w-20 h-2" />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Radar Chart */}
          <div className="space-y-4">
            <h4 className="font-medium text-center">Performance por Categoria</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke={getPerformanceColor(performanceScore.overall)}
                    fill={getPerformanceColor(performanceScore.overall)}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip formatter={(value) => [`${value}%`, 'Performance Score']} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benchmarkMetrics.map((metric) => {
            const Icon = metric.icon
            const benchmark = industryBenchmarks.find(b => b.segment === compareSegment)
            const benchmarkValue = benchmark?.metrics[metric.key as keyof typeof benchmark.metrics] || metric.industryAverage
            const percentageVsBenchmark = ((metric.currentValue - benchmarkValue) / benchmarkValue) * 100
            const goalProgress = (metric.currentValue / metric.goal) * 100

            return (
              <motion.div
                key={metric.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedCategory === metric.key 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedCategory(selectedCategory === metric.key ? null : metric.key)}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" style={{ color: metric.color }} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{metric.label}</p>
                      <p className="text-xs text-muted-foreground">{metric.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Seu valor</span>
                      <span className="font-semibold" style={{ color: metric.color }}>
                        {formatMetricValue(metric.currentValue, metric.unit)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Benchmark</span>
                      <span className="text-sm">
                        {formatMetricValue(benchmarkValue, metric.unit)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">vs. Benchmark</span>
                      <div className="flex items-center gap-1">
                        {getComparisonIcon(metric.currentValue, benchmarkValue, metric.improvement)}
                        <span className={`text-sm font-medium ${
                          percentageVsBenchmark > 0 
                            ? metric.improvement === 'higher' ? 'text-green-600' : 'text-red-600'
                            : metric.improvement === 'higher' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {percentageVsBenchmark > 0 ? '+' : ''}{percentageVsBenchmark.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {viewMode === 'goals' && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Meta</span>
                          <span>{formatMetricValue(metric.goal, metric.unit)}</span>
                        </div>
                        <Progress value={Math.min(100, goalProgress)} className="h-2" />
                        <p className="text-xs text-center text-muted-foreground">
                          {goalProgress.toFixed(1)}% da meta alcançada
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Detailed Metric View */}
        <AnimatePresence>
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 p-4 bg-muted/30 rounded-lg"
            >
              {(() => {
                const metric = benchmarkMetrics.find(m => m.key === selectedCategory)
                if (!metric) return null

                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <metric.icon className="w-6 h-6" style={{ color: metric.color }} />
                      <div>
                        <h4 className="text-lg font-semibold">{metric.label}</h4>
                        <p className="text-sm text-muted-foreground">{metric.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-2xl font-bold" style={{ color: metric.color }}>
                          {formatMetricValue(metric.currentValue, metric.unit)}
                        </p>
                        <p className="text-sm text-muted-foreground">Seu Valor</p>
                      </div>

                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-2xl font-bold text-muted-foreground">
                          {formatMetricValue(metric.industryAverage, metric.unit)}
                        </p>
                        <p className="text-sm text-muted-foreground">Média da Indústria</p>
                      </div>

                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {formatMetricValue(metric.topPerformer, metric.unit)}
                        </p>
                        <p className="text-sm text-muted-foreground">Top Performer</p>
                      </div>

                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">
                          {formatMetricValue(metric.goal, metric.unit)}
                        </p>
                        <p className="text-sm text-muted-foreground">Sua Meta</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium mb-3">Insights</h5>
                        <div className="space-y-2">
                          {metric.insights.map((insight, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <Eye className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                              <span>{insight}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-3">Recomendações</h5>
                        <div className="space-y-2">
                          {metric.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}