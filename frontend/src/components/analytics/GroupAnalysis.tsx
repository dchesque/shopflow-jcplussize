'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Users, DollarSign, TrendingUp, Clock, Calendar } from 'lucide-react'
import { analyticsAPI, GroupAnalysisData } from '@/lib/api/analytics'

export function GroupAnalysis() {
  const [data, setData] = useState<GroupAnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState(7)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await analyticsAPI.getGroupAnalysis(selectedPeriod)
      setData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedPeriod])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Análise de Grupos</h3>
          <RefreshCw className="w-4 h-4 animate-spin" />
        </div>
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2"></div>
              <p className="text-gray-500">Carregando análise de grupos...</p>
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
          <h3 className="text-lg font-semibold">Análise de Grupos</h3>
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
          <h3 className="text-lg font-semibold">Análise de Grupos</h3>
          <p className="text-sm text-gray-500">Comportamento e padrões de grupos de clientes</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={14}>Últimas 2 semanas</option>
            <option value={30}>Último mês</option>
          </select>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {data && (
        <div className="space-y-6">
          {/* Distribuição por Tamanho de Grupo */}
          <div>
            <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Distribuição por Tamanho de Grupo
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {(data.group_size_distribution || []).map((group, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-lg font-bold text-blue-900">
                      {group.size === 1 ? 'Individual' : `Grupo ${group.size}`}
                    </h5>
                    <Badge variant="secondary">{group.percentage}%</Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Clientes:</span>
                      <span className="font-medium">{group.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gasto médio:</span>
                      <span className="font-medium text-green-700">R$ {group.avg_spending.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-3 bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${group.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Padrões Comportamentais */}
          <div>
            <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Padrões Comportamentais Identificados
            </h4>
            <div className="space-y-3">
              {(data.group_behavior_patterns || []).map((pattern, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-semibold text-gray-900">{pattern.description}</h5>
                      <p className="text-sm text-gray-500">Padrão: {pattern.pattern.replace('_', ' ')}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        {pattern.frequency}% frequência
                      </Badge>
                      <br />
                      <Badge variant={pattern.conversion_rate > 0.6 ? "default" : "secondary"}>
                        {Math.round(pattern.conversion_rate * 100)}% conversão
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Características:</p>
                    <div className="flex flex-wrap gap-2">
                      {(pattern.characteristics || []).map((char, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {char}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estratégias Otimizadas */}
          <div>
            <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Estratégias Recomendadas
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {(data.optimal_strategies || []).map((strategy, index) => (
                <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-500 text-white rounded-full p-1">
                      <TrendingUp className="w-3 h-3" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-green-900 mb-1">
                        {strategy.group_type.charAt(0).toUpperCase() + strategy.group_type.slice(1)}
                      </h5>
                      <p className="text-sm text-green-800 mb-2">{strategy.recommendation}</p>
                      <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                        🎯 {strategy.impact}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Análise Temporal */}
          <div>
            <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Análise Temporal
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Horários de Pico */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium mb-3">Horários de Pico por Tipo</h5>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Grupos:</p>
                    <div className="flex flex-wrap gap-2">
                      {(data.time_analysis?.peak_group_hours || []).map((hour, idx) => (
                        <Badge key={idx} variant="default" className="text-xs">
                          {hour}
                        </Badge>
                      ))}
                      {(!data.time_analysis?.peak_group_hours || data.time_analysis.peak_group_hours.length === 0) && (
                        <span className="text-sm text-gray-500">Sem dados disponíveis</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Individuais:</p>
                    <div className="flex flex-wrap gap-2">
                      {(data.time_analysis?.solo_shopper_hours || []).map((hour, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {hour}
                        </Badge>
                      ))}
                      {(!data.time_analysis?.solo_shopper_hours || data.time_analysis.solo_shopper_hours.length === 0) && (
                        <span className="text-sm text-gray-500">Sem dados disponíveis</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fins de Semana vs Dias da Semana */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Padrão Semanal
                </h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fins de Semana</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(data.time_analysis?.weekend_vs_weekday?.weekend_group_ratio || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round((data.time_analysis?.weekend_vs_weekday?.weekend_group_ratio || 0) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Dias da Semana</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(data.time_analysis?.weekend_vs_weekday?.weekday_group_ratio || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round((data.time_analysis?.weekend_vs_weekday?.weekday_group_ratio || 0) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}