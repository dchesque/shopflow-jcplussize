'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp, Users, Clock, MapPin } from 'lucide-react'
import { analyticsAPI, FlowVisualizationData } from '@/lib/api/analytics'

export function FlowVisualization() {
  const [data, setData] = useState<FlowVisualizationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPath, setSelectedPath] = useState<number | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await analyticsAPI.getFlowVisualization(24)
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

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Visualização de Fluxo</h3>
          <RefreshCw className="w-4 h-4 animate-spin" />
        </div>
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2"></div>
              <p className="text-gray-500">Carregando dados de fluxo...</p>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Visualização de Fluxo</h3>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center text-red-500">
            <p className="mb-2">Erro ao carregar dados</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Visualização de Fluxo</h3>
          <p className="text-sm text-gray-500">Mapa de calor e trajetórias principais</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {data && (
        <div className="space-y-6">
          {/* Estatísticas Resumidas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total Visitantes</span>
              </div>
              <p className="text-xl font-bold text-blue-900">{(data.period_stats.total_visitors || 0).toLocaleString()}</p>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Rotas Únicas</span>
              </div>
              <p className="text-xl font-bold text-green-900">{data.period_stats.unique_paths || 0}</p>
            </div>

            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Tempo Médio</span>
              </div>
              <p className="text-xl font-bold text-orange-900">{data.period_stats.avg_visit_duration || '0.0'}min</p>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Hora Pico</span>
              </div>
              <p className="text-xl font-bold text-purple-900">{data.period_stats.busiest_hour || 'Aguardando dados'}</p>
            </div>
          </div>

          {/* Mapa de Calor */}
          <div>
            <h4 className="text-md font-semibold mb-3">Zonas Mais Visitadas</h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {data.heatmap_zones.map((zone, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium capitalize">{zone.zone}</h5>
                    <Badge variant={zone.intensity > 0.7 ? "destructive" : zone.intensity > 0.5 ? "default" : "secondary"}>
                      {Math.round(zone.intensity * 100)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{zone.visits} visitas</p>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${zone.intensity * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trajetórias Principais */}
          <div>
            <h4 className="text-md font-semibold mb-3">Trajetórias Principais</h4>
            <div className="space-y-3">
              {data.main_paths.map((path) => (
                <div 
                  key={path.path_id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPath === path.path_id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPath(selectedPath === path.path_id ? null : path.path_id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{path.name}</h5>
                    <div className="flex gap-2">
                      <Badge variant="outline">{path.frequency} pessoas</Badge>
                      <Badge variant={path.conversion_rate > 0.3 ? "default" : "secondary"}>
                        {Math.round(path.conversion_rate * 100)}% conversão
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Tempo médio:</span> {path.avg_time} min
                    </div>
                    <div>
                      <span className="font-medium">Frequência:</span> {path.frequency} pessoas/dia
                    </div>
                  </div>
                  
                  {selectedPath === path.path_id && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Coordenadas da rota:</p>
                      <div className="flex flex-wrap gap-2">
                        {path.coordinates.map((coord, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            ({coord.x}, {coord.y})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Gargalos */}
          {data.bottlenecks.length > 0 && (
            <div>
              <h4 className="text-md font-semibold mb-3">Gargalos Identificados</h4>
              <div className="space-y-2">
                {data.bottlenecks.map((bottleneck, index) => (
                  <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium capitalize">{bottleneck.zone}</h5>
                      <Badge variant={bottleneck.severity === 'high' ? "destructive" : "default"}>
                        {bottleneck.severity === 'high' ? 'Alto' : 'Médio'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Tempo de espera: {bottleneck.avg_wait_time} min
                    </p>
                    <p className="text-sm font-medium text-yellow-800">
                      💡 {bottleneck.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}