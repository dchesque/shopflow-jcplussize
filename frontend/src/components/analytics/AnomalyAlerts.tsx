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
  
  const generateMockAlerts = (): AnomalyAlert[] => [
    {
      id: 'alert_1',
      title: 'Queda Súbita no Fluxo de Pessoas',
      description: 'Redução de 35% no tráfego em relação ao esperado para este horário',
      severity: 'high',
      type: 'traffic',
      timestamp: new Date(Date.now() - 5 * 60000),
      location: 'Entrada Principal',
      value: 45,
      threshold: 70,
      deviation: -35.7,
      isAcknowledged: false,
      suggestedActions: [
        'Verificar se há problemas na entrada',
        'Conferir campanhas ativas',
        'Analisar fatores externos (clima, eventos)',
        'Considerar promoção flash'
      ],
      relatedMetrics: [
        { name: 'Pessoas/hora', current: 45, expected: 70, unit: 'pessoas' },
        { name: 'Taxa entrada', current: 62, expected: 85, unit: '%' }
      ],
      aiAnalysis: 'Padrão anômalo detectado às 14h30. Comparando com dados históricos, esta redução pode estar relacionada ao início de chuva na região. Recomenda-se monitorar por mais 30 minutos.'
    },
    {
      id: 'alert_2',
      title: 'Comportamento Incomum na Zona de Eletrônicos',
      description: 'Tempo de permanência 60% maior que o usual, mas conversão 40% menor',
      severity: 'medium',
      type: 'behavior',
      timestamp: new Date(Date.now() - 12 * 60000),
      location: 'Setor Eletrônicos',
      value: 18.5,
      threshold: 11.2,
      deviation: 65.2,
      isAcknowledged: false,
      suggestedActions: [
        'Enviar funcionário para verificar a área',
        'Verificar se produtos estão com preços visíveis',
        'Conferir se há problemas técnicos',
        'Oferecer atendimento proativo'
      ],
      relatedMetrics: [
        { name: 'Tempo permanência', current: 18.5, expected: 11.2, unit: 'min' },
        { name: 'Taxa conversão', current: 25, expected: 42, unit: '%' }
      ],
      aiAnalysis: 'Clientes estão permanecendo mais tempo mas não convertendo. Análise de vídeo mostra hesitação nas decisões. Possível problema de precificação ou disponibilidade de atendimento.'
    },
    {
      id: 'alert_3',
      title: 'Pico de Abandono no Checkout',
      description: 'Taxa de abandono 45% acima do normal nas últimas 2 horas',
      severity: 'critical',
      type: 'conversion',
      timestamp: new Date(Date.now() - 20 * 60000),
      location: 'Área de Checkout',
      value: 58,
      threshold: 40,
      deviation: 45.0,
      isAcknowledged: false,
      suggestedActions: [
        'Verificar filas e tempo de espera',
        'Adicionar caixas se necessário',
        'Verificar sistema de pagamento',
        'Oferecer checkout mobile/express'
      ],
      relatedMetrics: [
        { name: 'Taxa abandono', current: 58, expected: 40, unit: '%' },
        { name: 'Tempo fila', current: 8.5, expected: 4.2, unit: 'min' }
      ],
      aiAnalysis: 'Análise de fluxo mostra acúmulo na área de checkout. Sistema de pagamento funcionando normalmente. Provável causa: falta de caixas abertos para o volume atual.'
    },
    {
      id: 'alert_4',
      title: 'Aumento Repentino de Grupos Familiares',
      description: 'Detecção de grupos familiares 80% acima da média para este horário',
      severity: 'info',
      type: 'behavior',
      timestamp: new Date(Date.now() - 8 * 60000),
      location: 'Loja Inteira',
      value: 72,
      threshold: 40,
      deviation: 80.0,
      isAcknowledged: true,
      suggestedActions: [
        'Preparar área kids/família',
        'Destacar produtos familiares',
        'Ajustar música ambiente',
        'Reforçar segurança'
      ],
      relatedMetrics: [
        { name: 'Grupos familiares', current: 72, expected: 40, unit: '%' },
        { name: 'Crianças detectadas', current: 28, expected: 12, unit: 'crianças' }
      ],
      aiAnalysis: 'Padrão típico de sábado à tarde, mas iniciou mais cedo. Provavelmente relacionado a evento escolar ou feriado regional. Oportunidade para aumentar vendas de produtos familiares.'
    },
    {
      id: 'alert_5',
      title: 'Tempo de Resposta da IA Elevado',
      description: 'Processamento de detecções 200ms acima do normal',
      severity: 'low',
      type: 'technical',
      timestamp: new Date(Date.now() - 30 * 60000),
      value: 450,
      threshold: 250,
      deviation: 80.0,
      isAcknowledged: false,
      suggestedActions: [
        'Verificar carga do servidor',
        'Reiniciar serviços se necessário',
        'Monitorar uso de CPU/memória',
        'Considerar otimização de modelo'
      ],
      relatedMetrics: [
        { name: 'Tempo resposta', current: 450, expected: 250, unit: 'ms' },
        { name: 'CPU usage', current: 85, expected: 65, unit: '%' }
      ],
      aiAnalysis: 'Aumento na latência provavelmente devido ao maior volume de processamento. Sistema operando dentro dos limites, mas próximo ao threshold. Considerar escalonamento horizontal.'
    }
  ]
  
  const generateThresholds = (): AlertThreshold[] => [
    { type: 'traffic', label: 'Fluxo de Pessoas', enabled: true, threshold: 30, sensitivity: 'medium' },
    { type: 'conversion', label: 'Taxa de Conversão', enabled: true, threshold: 25, sensitivity: 'high' },
    { type: 'behavior', label: 'Padrões de Comportamento', enabled: true, threshold: 40, sensitivity: 'medium' },
    { type: 'security', label: 'Segurança', enabled: true, threshold: 10, sensitivity: 'high' },
    { type: 'technical', label: 'Sistema Técnico', enabled: false, threshold: 50, sensitivity: 'low' }
  ]
  
  const [thresholds, setThresholds] = useState(generateThresholds())
  
  useEffect(() => {
    setAlerts(generateMockAlerts())
    
    // Simulate real-time alerts
    const interval = setInterval(() => {
      if (alertsEnabled && Math.random() < 0.1) {
        const newAlert = generateMockAlerts()[Math.floor(Math.random() * 3)]
        newAlert.id = `alert_${Date.now()}`
        newAlert.timestamp = new Date()
        setAlerts(prev => [newAlert, ...prev.slice(0, 9)])
        onAnomalyDetected?.(newAlert)
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [alertsEnabled, onAnomalyDetected])
  
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