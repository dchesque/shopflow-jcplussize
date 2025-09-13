'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp, Target, Building2, Award, BarChart3 } from 'lucide-react'
import { analyticsAPI, BenchmarkData } from '@/lib/api/analytics'

export function StoreBenchmarks() {
  const [data, setData] = useState<BenchmarkData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndustry, setSelectedIndustry] = useState('retail')
  const [selectedStoreSize, setSelectedStoreSize] = useState('medium')

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await analyticsAPI.getBenchmarks(selectedIndustry, selectedStoreSize)
      setData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200'
      case 'above_average': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'below_average': return 'text-orange-600 bg-orange-50 border-orange-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPerformanceBadge = (status: string) => {
    switch (status) {
      case 'excellent': return 'Excelente'
      case 'above_average': return 'Acima da Média'
      case 'below_average': return 'Abaixo da Média'
      default: return 'Médio'
    }
  }

  if (loading && !data) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Benchmarks da Indústria</h3>
          <RefreshCw className="w-4 h-4 animate-spin" />
        </div>
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2"></div>
              <p className="text-gray-500">Carregando benchmarks...</p>
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
          <h3 className="text-lg font-semibold">Benchmarks da Indústria</h3>
          <p className="text-sm text-gray-500">Compare seu desempenho com a média do mercado</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Setor da Indústria
          </label>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="retail">Varejo</option>
            <option value="fashion">Moda</option>
            <option value="electronics">Eletrônicos</option>
            <option value="food">Alimentação</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tamanho da Loja
          </label>
          <select
            value={selectedStoreSize}
            onChange={(e) => setSelectedStoreSize(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="small">Pequena (até 100m²)</option>
            <option value="medium">Média (100-500m²)</option>
            <option value="large">Grande (500m²+)</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-800">
            <Target className="w-5 h-5" />
            <span className="font-medium">Erro:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Contexto do Mercado */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Contexto do Mercado
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Indústria</p>
                <p className="font-medium capitalize">{data.market_context.industry}</p>
              </div>
              <div>
                <p className="text-gray-600">Tamanho</p>
                <p className="font-medium">{data.market_context.store_size}</p>
              </div>
              <div>
                <p className="text-gray-600">Região</p>
                <p className="font-medium">{data.market_context.region}</p>
              </div>
              <div>
                <p className="text-gray-600">Amostra</p>
                <p className="font-medium">{data.market_context.sample_size} lojas</p>
              </div>
            </div>
          </div>

          {/* Performance da Loja vs Benchmarks */}
          <div>
            <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Performance vs Benchmarks
            </h4>
            <div className="space-y-4">
              {Object.entries(data.store_performance).map(([metric, performance]) => {
                const industryAvg = data.industry_averages[metric]
                const topPerformer = data.top_performers[metric]
                
                return (
                  <div key={metric} className={`border rounded-lg p-4 ${getPerformanceColor(performance.status)}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold capitalize">
                        {metric.replace('_', ' ').replace(/([A-Z])/g, ' $1')}
                      </h5>
                      <Badge variant="outline" className={getPerformanceColor(performance.status)}>
                        {getPerformanceBadge(performance.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">Sua Loja</p>
                        <p className="font-bold text-lg">{performance.value}</p>
                        <p className="text-xs">Percentil {performance.percentile}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Média da Indústria</p>
                        <p className="font-medium">{industryAvg.value}</p>
                        <p className="text-xs">Percentil {industryAvg.percentile}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Top Performers</p>
                        <p className="font-medium">{topPerformer.value}</p>
                        <p className="text-xs">Percentil {topPerformer.percentile}</p>
                      </div>
                    </div>
                    
                    {/* Barra de Progresso Visual */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                      <div className="relative bg-gray-200 rounded-full h-3">
                        {/* Sua posição */}
                        <div 
                          className="absolute bg-current h-3 rounded-full z-10"
                          style={{ 
                            left: `${performance.percentile}%`,
                            width: '8px',
                            transform: 'translateX(-4px)'
                          }}
                        />
                        {/* Média da indústria */}
                        <div 
                          className="absolute bg-gray-400 h-3 rounded-full"
                          style={{ 
                            left: `${industryAvg.percentile}%`,
                            width: '4px',
                            transform: 'translateX(-2px)'
                          }}
                        />
                        {/* Top performers */}
                        <div 
                          className="absolute bg-yellow-500 h-3 rounded-full"
                          style={{ 
                            left: `${topPerformer.percentile}%`,
                            width: '4px',
                            transform: 'translateX(-2px)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Oportunidades de Melhoria */}
          <div>
            <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Oportunidades de Melhoria
            </h4>
            <div className="space-y-4">
              {data.improvement_opportunities.map((opportunity, index) => (
                <div key={index} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-500 text-white rounded-full p-1">
                      <Target className="w-3 h-3" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-orange-900 mb-1 capitalize">
                        {opportunity.metric.replace('_', ' ')}
                      </h5>
                      <p className="text-sm text-orange-800 mb-2">
                        {opportunity.potential_impact}
                      </p>
                      <div className="text-xs text-orange-700 mb-3">
                        Atual: Percentil {opportunity.current_percentile} → 
                        Meta: Percentil {opportunity.target_percentile}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-orange-900 mb-2">Ações Recomendadas:</p>
                        <div className="space-y-1">
                          {opportunity.recommended_actions.map((action, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-orange-800">
                              <Award className="w-3 h-3" />
                              <span>{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Atualização dos Dados */}
          <div className="text-center text-sm text-gray-500">
            <p>Dados baseados em {data.market_context.data_freshness}</p>
            <p>Amostra de {data.market_context.sample_size} lojas similares</p>
          </div>
        </div>
      )}
    </Card>
  )
}

export default StoreBenchmarks