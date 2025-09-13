'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp, TrendingDown, Calendar, BarChart3, Users, DollarSign, Clock, Target } from 'lucide-react'
import { analyticsAPI, PeriodComparisonData } from '@/lib/api/analytics'

export function PeriodComparison() {
  const [data, setData] = useState<PeriodComparisonData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPeriod, setCurrentPeriod] = useState('2024-01-01 to 2024-01-31')
  const [comparisonPeriod, setComparisonPeriod] = useState('2023-12-01 to 2023-12-31')

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await analyticsAPI.getPeriodComparison(currentPeriod, comparisonPeriod)
      setData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />
    return <BarChart3 className="w-4 h-4 text-gray-500" />
  }

  const getTrendColor = (trend: string, isPositive: boolean = true) => {
    if (trend === 'up') return isPositive ? 'text-green-600' : 'text-red-600'
    if (trend === 'down') return isPositive ? 'text-red-600' : 'text-green-600'
    return 'text-gray-600'
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <TrendingUp className="w-5 h-5 text-green-500" />
      case 'negative': return <TrendingDown className="w-5 h-5 text-red-500" />
      default: return <BarChart3 className="w-5 h-5 text-blue-500" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'border-green-200 bg-green-50'
      case 'negative': return 'border-red-200 bg-red-50'
      default: return 'border-blue-200 bg-blue-50'
    }
  }

  if (loading && !data) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Comparação de Períodos</h3>
          <RefreshCw className="w-4 h-4 animate-spin" />
        </div>
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2"></div>
              <p className="text-gray-500">Carregando comparação...</p>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Comparação de Períodos</h3>
          <p className="text-sm text-gray-500">Compare métricas entre diferentes períodos</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Analisar
        </Button>
      </div>

      {/* Seleção de Períodos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período Atual
          </label>
          <input
            type="text"
            value={currentPeriod}
            onChange={(e) => setCurrentPeriod(e.target.value)}
            placeholder="YYYY-MM-DD to YYYY-MM-DD"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período de Comparação
          </label>
          <input
            type="text"
            value={comparisonPeriod}
            onChange={(e) => setComparisonPeriod(e.target.value)}
            placeholder="YYYY-MM-DD to YYYY-MM-DD"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-800">
            <TrendingDown className="w-5 h-5" />
            <span className="font-medium">Erro:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Métricas Comparativas */}
          <div>
            <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Métricas Comparativas
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Visitantes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Visitantes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(data.variations.visitors.trend)}
                    <span className={`text-sm font-medium ${getTrendColor(data.variations.visitors.trend)}`}>
                      {data.variations.visitors.percentage > 0 ? '+' : ''}{data.variations.visitors.percentage}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Atual</p>
                    <p className="font-bold text-blue-900">{data.current_period.visitors.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Anterior</p>
                    <p className="font-bold text-gray-700">{data.comparison_period.visitors.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Vendas */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Vendas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(data.variations.sales.trend)}
                    <span className={`text-sm font-medium ${getTrendColor(data.variations.sales.trend)}`}>
                      {data.variations.sales.percentage > 0 ? '+' : ''}{data.variations.sales.percentage}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Atual</p>
                    <p className="font-bold text-green-900">{data.current_period.sales.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Anterior</p>
                    <p className="font-bold text-gray-700">{data.comparison_period.sales.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Receita */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-800">Receita</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(data.variations.revenue.trend)}
                    <span className={`text-sm font-medium ${getTrendColor(data.variations.revenue.trend)}`}>
                      {data.variations.revenue.percentage > 0 ? '+' : ''}{data.variations.revenue.percentage}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Atual</p>
                    <p className="font-bold text-purple-900">R$ {data.current_period.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Anterior</p>
                    <p className="font-bold text-gray-700">R$ {data.comparison_period.revenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Métricas Secundárias */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-800">Taxa de Conversão</span>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(data.variations.conversion_rate.trend)}
                  <span className={`text-sm font-medium ${getTrendColor(data.variations.conversion_rate.trend)}`}>
                    {data.variations.conversion_rate.percentage > 0 ? '+' : ''}{data.variations.conversion_rate.percentage}%
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">Atual</p>
                  <p className="font-bold text-orange-900">{data.current_period.conversion_rate}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Anterior</p>
                  <p className="font-bold text-gray-700">{data.comparison_period.conversion_rate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium text-indigo-800">Tempo Médio</span>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(data.variations.avg_time_spent.trend)}
                  <span className={`text-sm font-medium ${getTrendColor(data.variations.avg_time_spent.trend)}`}>
                    {data.variations.avg_time_spent.percentage > 0 ? '+' : ''}{data.variations.avg_time_spent.percentage}%
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">Atual</p>
                  <p className="font-bold text-indigo-900">{data.current_period.avg_time_spent} min</p>
                </div>
                <div>
                  <p className="text-gray-600">Anterior</p>
                  <p className="font-bold text-gray-700">{data.comparison_period.avg_time_spent} min</p>
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div>
            <h4 className="text-md font-semibold mb-4">Insights da Comparação</h4>
            <div className="space-y-3">
              {data.insights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 mb-1">{insight.title}</h5>
                      <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                      <Badge variant="outline" className={`text-xs ${
                        insight.impact === 'high' ? 'border-red-300 text-red-700' :
                        insight.impact === 'medium' ? 'border-yellow-300 text-yellow-700' :
                        'border-green-300 text-green-700'
                      }`}>
                        Impacto: {insight.impact === 'high' ? 'Alto' : insight.impact === 'medium' ? 'Médio' : 'Baixo'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Significância Estatística */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Significância Estatística
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Nível de Confiança</p>
                <p className="font-bold">{data.statistical_significance.confidence_level}%</p>
              </div>
              <div>
                <p className="text-gray-600">Resultado</p>
                <Badge variant={data.statistical_significance.is_significant ? "default" : "secondary"}>
                  {data.statistical_significance.is_significant ? 'Significativo' : 'Não Significativo'}
                </Badge>
              </div>
              <div>
                <p className="text-gray-600">P-Value</p>
                <p className="font-bold">{data.statistical_significance.p_value}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default PeriodComparison