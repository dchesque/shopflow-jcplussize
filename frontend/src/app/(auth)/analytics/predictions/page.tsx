'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Brain, TrendingUp, AlertTriangle, Clock,
  Zap, Target, BarChart3, RefreshCw,
  Calendar, Users, DollarSign, Activity,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react'
import {
  fetchPredictions,
  type Prediction
} from '@/lib/api/supabase-analytics'

// Temporary inline components for Docker build
const Card = ({ children, className = "", ...props }: any) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props}>
    {children}
  </div>
)

const Badge = ({ children, variant = "default", className = "" }: any) => {
  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-input bg-background",
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    danger: "bg-red-100 text-red-800 border-red-200"
  }
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant as keyof typeof variantClasses] || variantClasses.default} ${className}`}>
      {children}
    </div>
  )
}

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

const Tabs = ({ children, value, onValueChange, className = "" }: any) => (
  <div className={className}>
    {children}
  </div>
)

const TabsList = ({ children, className = "" }: any) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}>
    {children}
  </div>
)

const TabsTrigger = ({ children, value, className = "", isActive = false, onClick }: any) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${isActive ? 'bg-background text-foreground shadow-sm' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
)

const TabsContent = ({ children, value, activeValue, className = "" }: any) => (
  <div className={`mt-2 ${value === activeValue ? '' : 'hidden'} ${className}`}>
    {children}
  </div>
)

export default function PredictionsPage() {
  const [loading, setLoading] = useState(false)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [selectedTimeHorizon, setSelectedTimeHorizon] = useState('24h')

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  // Função para carregar predições
  const loadPredictions = async (type?: string) => {
    setLoading(true)
    try {
      const predictionData = await fetchPredictions(type)
      setPredictions(predictionData)
    } catch (error) {
      console.error('Error loading predictions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadPredictions(activeTab === 'all' ? undefined : activeTab)

    // Atualizar a cada 60 segundos
    const interval = setInterval(() => {
      loadPredictions(activeTab === 'all' ? undefined : activeTab)
    }, 60000)

    return () => clearInterval(interval)
  }, [activeTab])

  // Filtrar predições por tipo
  const filteredPredictions = activeTab === 'all'
    ? predictions
    : predictions.filter(p => p.type === activeTab)

  // Função para obter ícone do tipo de predição
  const getPredictionIcon = (type: string) => {
    switch (type) {
      case 'traffic': return Users
      case 'sales': return DollarSign
      case 'conversion': return Target
      case 'anomaly': return AlertTriangle
      default: return Activity
    }
  }

  // Função para obter cor baseada na confiança
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Função para obter badge de confiança
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return { variant: 'success', text: 'Alta Confiança' }
    if (confidence >= 60) return { variant: 'warning', text: 'Média Confiança' }
    return { variant: 'danger', text: 'Baixa Confiança' }
  }

  // Calcular estatísticas das predições
  const stats = {
    totalPredictions: predictions.length,
    highConfidence: predictions.filter(p => p.confidence >= 80).length,
    anomalies: predictions.filter(p => p.type === 'anomaly').length,
    avgConfidence: predictions.length > 0
      ? predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
      : 0
  }

  const tabsData = [
    { id: 'all', label: 'Todas', icon: Brain },
    { id: 'traffic', label: 'Tráfego', icon: Users },
    { id: 'sales', label: 'Vendas', icon: DollarSign },
    { id: 'conversion', label: 'Conversão', icon: Target },
    { id: 'anomaly', label: 'Anomalias', icon: AlertTriangle }
  ]

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
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Predições Analytics</h1>
              <p className="text-muted-foreground">
                Análises preditivas avançadas baseadas em IA e dados históricos do Supabase
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadPredictions(activeTab === 'all' ? undefined : activeTab)}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Predições</p>
                <p className="text-lg font-semibold">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    stats.totalPredictions
                  )}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Alta Confiança</p>
                <p className="text-lg font-semibold">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    stats.highConfidence
                  )}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Anomalias</p>
                <p className="text-lg font-semibold">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    stats.anomalies
                  )}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Confiança Média</p>
                <p className="text-lg font-semibold">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    `${stats.avgConfidence.toFixed(0)}%`
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filtros por Tipo */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {tabsData.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="gap-2"
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {/* Content */}
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredPredictions.length === 0 ? (
            <Card className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma predição encontrada</h3>
              <p className="text-muted-foreground">Tente atualizar os dados ou selecionar outro filtro.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPredictions.map((prediction, index) => {
                const Icon = getPredictionIcon(prediction.type)
                const confidenceBadge = getConfidenceBadge(prediction.confidence)

                return (
                  <motion.div
                    key={prediction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold capitalize">
                              {prediction.type === 'traffic' ? 'Predição de Tráfego' :
                               prediction.type === 'sales' ? 'Predição de Vendas' :
                               prediction.type === 'conversion' ? 'Predição de Conversão' :
                               prediction.type === 'anomaly' ? 'Detecção de Anomalia' :
                               'Predição'}
                            </h3>
                            <p className="text-sm text-muted-foreground">{prediction.time_horizon}</p>
                          </div>
                        </div>
                        <Badge variant={confidenceBadge.variant as any}>
                          {prediction.confidence}% de confiança
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        {/* Valor Predito */}
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm font-medium">Valor Predito:</span>
                          <span className="text-lg font-bold">
                            {prediction.type === 'traffic' ? `${prediction.predicted_value} visitantes` :
                             prediction.type === 'sales' ? `${prediction.predicted_value} vendas` :
                             prediction.type === 'conversion' ? `${prediction.predicted_value}%` :
                             prediction.predicted_value}
                          </span>
                        </div>

                        {/* Fatores */}
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Fatores Considerados:</h4>
                          <div className="flex flex-wrap gap-1">
                            {prediction.factors.map((factor, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Recomendações */}
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Recomendações:</h4>
                          <ul className="space-y-1">
                            {prediction.recommendations.map((recommendation, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                {recommendation}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Timestamp */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                          <Clock className="w-3 h-3" />
                          Gerado em: {new Date(prediction.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </Tabs>

      {/* Footer Info */}
      <Card className="p-4 bg-muted/30">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Predições baseadas em dados históricos do Supabase</span>
            <Badge variant="outline" className="gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              IA Ativa
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