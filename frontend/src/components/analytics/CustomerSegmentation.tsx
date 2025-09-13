'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Users, Target, TrendingUp, Crown, UserCheck, UserX } from 'lucide-react'
import { analyticsAPI } from '@/lib/api/analytics'

interface SegmentationData {
  segments: Record<string, number>
  percentages: Record<string, number>
  total_customers: number
  analysis_period_days: number
  insights: {
    dominant_segment: string
    growth_segments: string[]
    at_risk_segments: string[]
  }
}

export function CustomerSegmentation() {
  const [data, setData] = useState<SegmentationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState(30)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await analyticsAPI.getCustomerSegmentation(selectedPeriod)
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

  // Helper para definir cores e ícones por segmento
  const getSegmentInfo = (segment: string) => {
    const segmentMap: Record<string, { color: string; icon: React.ReactNode; description: string }> = {
      'new': { 
        color: 'bg-blue-50 border-blue-200 text-blue-800', 
        icon: <UserCheck className="w-4 h-4 text-blue-600" />,
        description: 'Novos clientes'
      },
      'regular': { 
        color: 'bg-green-50 border-green-200 text-green-800', 
        icon: <Users className="w-4 h-4 text-green-600" />,
        description: 'Clientes regulares'
      },
      'vip': { 
        color: 'bg-purple-50 border-purple-200 text-purple-800', 
        icon: <Crown className="w-4 h-4 text-purple-600" />,
        description: 'Clientes VIP'
      },
      'at_risk': { 
        color: 'bg-orange-50 border-orange-200 text-orange-800', 
        icon: <UserX className="w-4 h-4 text-orange-600" />,
        description: 'Em risco de churn'
      },
      'occasional': { 
        color: 'bg-gray-50 border-gray-200 text-gray-800', 
        icon: <Target className="w-4 h-4 text-gray-600" />,
        description: 'Clientes ocasionais'
      }
    }
    return segmentMap[segment] || { 
      color: 'bg-gray-50 border-gray-200 text-gray-800', 
      icon: <Users className="w-4 h-4 text-gray-600" />,
      description: 'Outros'
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Segmentação de Clientes</h3>
          <RefreshCw className="w-4 h-4 animate-spin" />
        </div>
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2"></div>
              <p className="text-gray-500">Carregando segmentação...</p>
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
          <h3 className="text-lg font-semibold">Segmentação de Clientes</h3>
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
          <h3 className="text-lg font-semibold">Segmentação de Clientes</h3>
          <p className="text-sm text-gray-500">Análise baseada em IA dos perfis de clientes</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Último mês</option>
            <option value={90}>Últimos 3 meses</option>
          </select>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {data && (
        <div className="space-y-6">
          {/* Estatísticas Resumidas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total de Clientes</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{data.total_customers.toLocaleString()}</p>
              <p className="text-xs text-blue-600 mt-1">Período: {data.analysis_period_days} dias</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Segmento Dominante</span>
              </div>
              <p className="text-lg font-bold text-green-900 capitalize">
                {data.insights.dominant_segment?.replace('_', ' ') || 'N/A'}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {data.percentages[data.insights.dominant_segment]}% dos clientes
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Em Crescimento</span>
              </div>
              <p className="text-lg font-bold text-orange-900">{data.insights.growth_segments.length}</p>
              <p className="text-xs text-orange-600 mt-1">Segmentos promissores</p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <UserX className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Em Risco</span>
              </div>
              <p className="text-lg font-bold text-red-900">{data.insights.at_risk_segments.length}</p>
              <p className="text-xs text-red-600 mt-1">Segmentos em risco</p>
            </div>
          </div>

          {/* Distribuição dos Segmentos */}
          <div>
            <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Distribuição dos Segmentos
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Object.entries(data.segments).map(([segment, count]) => {
                const segmentInfo = getSegmentInfo(segment)
                const percentage = data.percentages[segment] || 0
                
                return (
                  <div key={segment} className={`p-4 rounded-lg border ${segmentInfo.color}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {segmentInfo.icon}
                        <h5 className="font-semibold capitalize">
                          {segment.replace('_', ' ')}
                        </h5>
                      </div>
                      <Badge variant="outline" className="font-bold">
                        {percentage}%
                      </Badge>
                    </div>
                    
                    <p className="text-sm mb-3">{segmentInfo.description}</p>
                    
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Clientes:</span>
                      <span className="font-semibold">{count.toLocaleString()}</span>
                    </div>
                    
                    <div className="bg-white bg-opacity-50 rounded-full h-3">
                      <div 
                        className="bg-current h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          opacity: 0.8
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Insights e Recomendações */}
          <div>
            <h4 className="text-md font-semibold mb-4">Insights e Recomendações</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Segmentos em Crescimento */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h5 className="font-semibold text-green-800">Segmentos em Crescimento</h5>
                </div>
                <div className="space-y-2">
                  {data.insights.growth_segments.map((segment, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-green-700 capitalize">
                        {segment.replace('_', ' ')}
                      </span>
                      <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                        +{data.segments[segment] || 0} clientes
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-800">
                  💡 <strong>Recomendação:</strong> Invista em campanhas direcionadas para estes segmentos promissores
                </div>
              </div>

              {/* Segmentos em Risco */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <UserX className="w-5 h-5 text-orange-600" />
                  <h5 className="font-semibold text-orange-800">Segmentos em Risco</h5>
                </div>
                <div className="space-y-2">
                  {data.insights.at_risk_segments.map((segment, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-orange-700 capitalize">
                        {segment.replace('_', ' ')}
                      </span>
                      <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                        {data.segments[segment] || 0} clientes
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-2 bg-orange-100 rounded text-xs text-orange-800">
                  ⚠️ <strong>Ação Necessária:</strong> Implemente programas de retenção para reduzir churn
                </div>
              </div>
            </div>
          </div>

          {/* Estratégias por Segmento */}
          <div>
            <h4 className="text-md font-semibold mb-4">Estratégias Recomendadas por Segmento</h4>
            <div className="space-y-3">
              {Object.entries(data.segments).map(([segment, count]) => {
                const strategies = {
                  'new': 'Campanhas de boas-vindas e programas de onboarding para aumentar o engajamento inicial',
                  'regular': 'Programas de fidelidade e ofertas personalizadas para manter a consistência',
                  'vip': 'Atendimento premium, acesso antecipado a produtos e experiências exclusivas',
                  'at_risk': 'Campanhas de reativação, pesquisas de satisfação e ofertas especiais de retenção',
                  'occasional': 'Lembretes proativos, ofertas sazonais e campanhas de frequência'
                }
                
                const strategy = strategies[segment as keyof typeof strategies] || 'Estratégia personalizada baseada no comportamento'
                const segmentInfo = getSegmentInfo(segment)
                
                return (
                  <div key={segment} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      {segmentInfo.icon}
                      <h5 className="font-semibold capitalize">{segment.replace('_', ' ')}</h5>
                      <Badge variant="secondary">{count} clientes</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{strategy}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}