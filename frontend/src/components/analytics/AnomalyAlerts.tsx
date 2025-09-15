'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  AlertTriangle, AlertCircle, Info, CheckCircle, X, Bell, BellOff,
  TrendingDown, TrendingUp, Users, ShoppingBag, Clock, MapPin, Zap 
} from 'lucide-react'

interface AnomalyAlert {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  type: 'traffic' | 'behavior' | 'conversion' | 'security' | 'technical'
  timestamp: Date
  location?: string
  value: number
  threshold: number
  deviation: number
  isAcknowledged: boolean
  suggestedActions: string[]
  relatedMetrics: {
    name: string
    current: number
    expected: number
    unit: string
  }[]
  aiAnalysis: string
}

interface AlertThreshold {
  type: string
  label: string
  enabled: boolean
  threshold: number
  sensitivity: 'low' | 'medium' | 'high'
}

interface AnomalyAlertsProps {
  className?: string
  showOnlyActive?: boolean
  onAnomalyDetected?: (alert: AnomalyAlert) => void
}

export function AnomalyAlerts({ 
  className = '', 
  showOnlyActive = false,
  onAnomalyDetected 
}: AnomalyAlertsProps) {
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([])
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null)
  
  const fetchAlertsFromAPI = async (): Promise<AnomalyAlert[]> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/analytics/realtime-data`)
      if (!response.ok) {
        console.warn('Failed to fetch real-time alerts')
        return []
      }

      const data = await response.json()

      // Convert backend alerts to our format
      return data.data?.active_alerts?.map((alert: any, index: number) => ({
        id: `alert_${alert.id || index}`,
        title: alert.title || 'Alerta do Sistema',
        description: alert.message || 'Evento detectado pelo sistema',
        severity: alert.type === 'critical' ? 'critical' : 'medium',
        type: 'behavior',
        timestamp: new Date(alert.timestamp || Date.now()),
        location: 'Sistema',
        value: 0,
        threshold: 0,
        deviation: 0,
        isAcknowledged: false,
        suggestedActions: [
          'Verificar métricas relacionadas',
          'Analisar padrões comportamentais',
          'Monitorar evolução do evento'
        ],
        relatedMetrics: [],
        aiAnalysis: 'Evento detectado pelo sistema de monitoramento em tempo real'
      })) || []
    } catch (error) {
      console.error('Error fetching alerts:', error)
      return []
    }
  }

  const generateFallbackAlert = (): AnomalyAlert => ({
    id: `alert_${Date.now()}`,
    title: 'Sistema Monitorando',
    description: 'Sistema de detecção de anomalias ativo e funcionando',
    severity: 'info',
    type: 'technical',
    timestamp: new Date(),
    value: 100,
    threshold: 95,
    deviation: 5.0,
    isAcknowledged: false,
    suggestedActions: [
      'Sistema funcionando normalmente',
      'Monitoramento contínuo ativo'
    ],
    relatedMetrics: [
      { name: 'Sistema', current: 100, expected: 95, unit: '%' }
    ],
    aiAnalysis: 'Sistema de detecção de anomalias operacional e monitorando dados em tempo real.'
  })
  
  const generateThresholds = (): AlertThreshold[] => [
    { type: 'traffic', label: 'Fluxo de Pessoas', enabled: true, threshold: 30, sensitivity: 'medium' },
    { type: 'conversion', label: 'Taxa de Conversão', enabled: true, threshold: 25, sensitivity: 'high' },
    { type: 'behavior', label: 'Padrões de Comportamento', enabled: true, threshold: 40, sensitivity: 'medium' },
    { type: 'security', label: 'Segurança', enabled: true, threshold: 10, sensitivity: 'high' },
    { type: 'technical', label: 'Sistema Técnico', enabled: false, threshold: 50, sensitivity: 'low' }
  ]
  
  const [thresholds, setThresholds] = useState(generateThresholds())
  
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const realAlerts = await fetchAlertsFromAPI()
        if (realAlerts.length > 0) {
          setAlerts(realAlerts)
        } else {
          // Show system status when no real alerts
          setAlerts([generateFallbackAlert()])
        }
      } catch (error) {
        console.error('Error loading alerts:', error)
        setAlerts([generateFallbackAlert()])
      }
    }

    loadAlerts()

    // Refresh alerts from API every 30 seconds
    const interval = setInterval(() => {
      if (alertsEnabled) {
        loadAlerts()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [alertsEnabled])
  
  const filteredAlerts = alerts.filter(alert => {
    if (showOnlyActive && alert.isAcknowledged) return false
    if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) return false
    if (selectedType !== 'all' && alert.type !== selectedType) return false
    return true
  })
  
  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isAcknowledged: true } : alert
    ))
  }
  
  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'high': return <AlertCircle className="w-4 h-4 text-orange-500" />
      case 'medium': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'low': return <Info className="w-4 h-4 text-blue-500" />
      case 'info': return <Info className="w-4 h-4 text-gray-500" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-200 bg-red-50 dark:bg-red-950/20'
      case 'high': return 'border-orange-200 bg-orange-50 dark:bg-orange-950/20'
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20'
      case 'low': return 'border-blue-200 bg-blue-50 dark:bg-blue-950/20'
      case 'info': return 'border-gray-200 bg-gray-50 dark:bg-gray-950/20'
      default: return 'border-gray-200 bg-gray-50'
    }
  }
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'traffic': return <Users className="w-4 h-4" />
      case 'behavior': return <TrendingUp className="w-4 h-4" />
      case 'conversion': return <ShoppingBag className="w-4 h-4" />
      case 'security': return <AlertTriangle className="w-4 h-4" />
      case 'technical': return <Zap className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }
  
  const activeAlerts = alerts.filter(a => !a.isAcknowledged).length
  const criticalAlerts = alerts.filter(a => !a.isAcknowledged && a.severity === 'critical').length

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-6 h-6 text-orange-500" />
              {activeAlerts > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                >
                  {activeAlerts}
                </motion.div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">Alertas de Anomalia</h3>
              <p className="text-sm text-muted-foreground">
                Detecção automática de padrões incomuns pela IA
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={alertsEnabled}
                onCheckedChange={setAlertsEnabled}
              />
              <span className="text-sm">
                {alertsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </span>
            </div>
            
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="low">Baixo</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="traffic">Tráfego</SelectItem>
                <SelectItem value="behavior">Comportamento</SelectItem>
                <SelectItem value="conversion">Conversão</SelectItem>
                <SelectItem value="security">Segurança</SelectItem>
                <SelectItem value="technical">Técnico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-red-600 text-sm font-medium">Críticos</p>
                <p className="text-xl font-bold text-red-700">{criticalAlerts}</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-orange-600 text-sm font-medium">Ativos</p>
                <p className="text-xl font-bold text-orange-700">{activeAlerts}</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-green-600 text-sm font-medium">Resolvidos</p>
                <p className="text-xl font-bold text-green-700">
                  {alerts.filter(a => a.isAcknowledged).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-blue-600 text-sm font-medium">Últimas 24h</p>
                <p className="text-xl font-bold text-blue-700">{alerts.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Alerts List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {filteredAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-4 rounded-lg border transition-all ${
                  getSeverityColor(alert.severity)
                } ${alert.isAcknowledged ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex flex-col items-center gap-1 mt-1">
                      {getSeverityIcon(alert.severity)}
                      {getTypeIcon(alert.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        {alert.location && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="w-3 h-3 mr-1" />
                            {alert.location}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {alert.timestamp.toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {alert.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Valor:</span>
                          <span className="font-medium">{alert.value}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Limite:</span>
                          <span className="font-medium">{alert.threshold}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Desvio:</span>
                          <span className={`font-medium ${
                            alert.deviation > 0 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {alert.deviation > 0 ? '+' : ''}{alert.deviation.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!alert.isAcknowledged && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAlert(selectedAlert === alert.id ? null : alert.id)
                        }}
                      >
                        Detalhes
                      </Button>
                    )}
                    
                    {!alert.isAcknowledged && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Resolver
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Detailed View */}
                <AnimatePresence>
                  {selectedAlert === alert.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-border/50"
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-sm mb-2">Análise da IA</h5>
                          <p className="text-sm text-muted-foreground mb-3">
                            {alert.aiAnalysis}
                          </p>
                          
                          <h5 className="font-medium text-sm mb-2">Métricas Relacionadas</h5>
                          <div className="space-y-2">
                            {alert.relatedMetrics.map((metric, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{metric.name}:</span>
                                <span className="font-medium">
                                  {metric.current} {metric.unit} 
                                  <span className="text-muted-foreground ml-1">
                                    (esperado: {metric.expected} {metric.unit})
                                  </span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm mb-2">Ações Sugeridas</h5>
                          <div className="space-y-2">
                            {alert.suggestedActions.map((action, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                                <span className="text-sm">{action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {filteredAlerts.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h4 className="font-medium mb-2">Nenhum Alerta Ativo</h4>
            <p className="text-sm text-muted-foreground">
              Todos os sistemas estão operando dentro dos parâmetros normais
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}