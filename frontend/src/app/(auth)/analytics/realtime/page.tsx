'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Users, Clock, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { analyticsAPI, RealtimeData } from '@/lib/api/analytics'

export default function RealtimeAnalyticsPage() {
  const [data, setData] = useState<RealtimeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchData = async () => {
    try {
      setError(null)
      const response = await analyticsAPI.getRealtimeData()
      setData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchData, 30000) // Atualiza a cada 30 segundos
    return () => clearInterval(interval)
  }, [autoRefresh])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'agora'
    if (diffMins < 60) return `há ${diffMins} min`
    const diffHours = Math.floor(diffMins / 60)
    return `há ${diffHours}h`
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'border-green-200 bg-green-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'error': return 'border-red-200 bg-red-50'
      default: return 'border-blue-200 bg-blue-50'
    }
  }

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-50'
      case 'warning': return 'border-orange-500 bg-orange-50'
      default: return 'border-blue-500 bg-blue-50'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics em Tempo Real</h1>
          <p className="text-gray-600">Monitore métricas e atividades em tempo real</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? "Pausar Auto-refresh" : "Ativar Auto-refresh"}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Erro ao carregar dados:</span>
            <span>{error}</span>
          </div>
        </Card>
      )}

      {data && (
        <>
          {/* Métricas em Tempo Real */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">Pessoas Online</h3>
              </div>
              <p className="text-3xl font-bold text-green-900">{data.current_metrics.people_online}</p>
              <p className="text-sm text-green-600">+12% vs última hora</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-800">Tempo Médio</h3>
              </div>
              <p className="text-3xl font-bold text-blue-900">{data.current_metrics.avg_time_spent}min</p>
              <p className="text-sm text-blue-600">-2% vs última hora</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-yellow-800">Taxa Conversão</h3>
              </div>
              <p className="text-3xl font-bold text-yellow-900">{data.current_metrics.conversion_rate}%</p>
              <p className="text-sm text-yellow-600">+5% vs última hora</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800">Alertas Ativos</h3>
              </div>
              <p className="text-3xl font-bold text-red-900">{data.current_metrics.active_alerts}</p>
              <p className="text-sm text-red-600">
                {data.active_alerts.filter(a => a.type === 'critical').length} críticos, {' '}
                {data.active_alerts.filter(a => a.type === 'warning').length} avisos
              </p>
            </Card>
          </div>

          {/* Tendência Horária */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tendência das Últimas Horas</h3>
            <div className="flex items-end gap-2 h-32">
              {data.hourly_trend.map((item, index) => {
                const maxCount = Math.max(...data.hourly_trend.map(d => d.count))
                const height = (item.count / maxCount) * 100
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="bg-blue-500 rounded-t w-full transition-all duration-300 hover:bg-blue-600"
                      style={{ height: `${height}%` }}
                      title={`${item.hour}: ${item.count} pessoas`}
                    />
                    <span className="text-xs text-gray-500 mt-2">{item.hour.split(':')[0]}h</span>
                    <span className="text-xs font-medium">{item.count}</span>
                  </div>
                )
              })}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feed de Atividades */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Feed de Atividades</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {data.recent_activities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className={`p-3 rounded-lg border ${getSeverityColor(activity.severity)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(activity.severity)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Alertas Ativos */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Alertas Ativos</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {data.active_alerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p>Nenhum alerta ativo</p>
                  </div>
                ) : (
                  data.active_alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`p-4 rounded-lg border-l-4 ${getAlertTypeColor(alert.type)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-2">{formatTime(alert.timestamp)}</p>
                        </div>
                        <Badge 
                          variant={alert.type === 'critical' ? 'destructive' : 'default'}
                          className="ml-2"
                        >
                          {alert.type === 'critical' ? 'Crítico' : 'Aviso'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Indicador de Última Atualização */}
          <div className="flex items-center justify-center text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span>
                {autoRefresh ? 'Atualizando automaticamente' : 'Auto-refresh pausado'}
                {data && ' • Última atualização: agora'}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}