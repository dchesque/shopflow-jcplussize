'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Lightbulb, TrendingUp, Users, Clock, MapPin, ShoppingBag, 
  Target, DollarSign, Brain, CheckCircle, X, ThumbsUp, ThumbsDown,
  Calendar, Zap, Award, AlertTriangle, Info
} from 'lucide-react'

interface AIRecommendation {
  id: string
  category: 'staff' | 'layout' | 'marketing' | 'inventory' | 'timing' | 'customer_service'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  impact: {
    revenue: number
    efficiency: number
    satisfaction: number
  }
  confidence: number
  timeframe: string
  effort: 'low' | 'medium' | 'high'
  reasoning: string
  data_sources: string[]
  expected_results: string[]
  implementation_steps: string[]
  metrics_to_track: string[]
  status: 'new' | 'in_review' | 'accepted' | 'implemented' | 'rejected'
  feedback?: 'positive' | 'negative'
  timestamp: Date
}

interface RecommendationCategory {
  id: string
  name: string
  icon: any
  color: string
  count: number
}

interface AIRecommendationsProps {
  className?: string
  category?: string
  onRecommendationAction?: (id: string, action: 'accept' | 'reject' | 'implement') => void
}

export function AIRecommendations({ 
  className = '', 
  category = 'all',
  onRecommendationAction 
}: AIRecommendationsProps) {
  const [selectedCategory, setSelectedCategory] = useState(category)
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('new')
  const [expandedRec, setExpandedRec] = useState<string | null>(null)
  
  const generateRecommendations = (): AIRecommendation[] => [
    {
      id: 'rec_1',
      category: 'staff',
      title: 'Otimização de Horários de Funcionários',
      description: 'Ajustar escala para cobrir picos de movimento identificados pela IA',
      priority: 'high',
      impact: { revenue: 15, efficiency: 25, satisfaction: 10 },
      confidence: 92,
      timeframe: 'Próxima semana',
      effort: 'low',
      reasoning: 'Análise de 30 dias mostra padrão consistente de sobrecarga às 14h-16h e subutilização às 10h-12h. Redistribuição pode aumentar eficiência em 25%.',
      data_sources: ['Fluxo de pessoas', 'Tempo de atendimento', 'Filas no checkout', 'Satisfação do cliente'],
      expected_results: [
        'Redução de 40% no tempo de espera em filas',
        'Aumento de 15% na satisfação do atendimento',
        'Otimização de 25% nos custos de pessoal'
      ],
      implementation_steps: [
        'Revisar escala atual com base nos dados',
        'Identificar funcionários com flexibilidade de horário',
        'Implementar nova escala por 2 semanas de teste',
        'Monitorar métricas e ajustar conforme necessário'
      ],
      metrics_to_track: ['Tempo médio de fila', 'Satisfação cliente', 'Produtividade por funcionário'],
      status: 'new',
      timestamp: new Date(Date.now() - 2 * 60000)
    },
    {
      id: 'rec_2',
      category: 'layout',
      title: 'Reorganização da Seção de Eletrônicos',
      description: 'Mover produtos de alta rotação para área de maior visibilidade',
      priority: 'medium',
      impact: { revenue: 22, efficiency: 8, satisfaction: 15 },
      confidence: 85,
      timeframe: 'Próximo fim de semana',
      effort: 'medium',
      reasoning: 'Heatmap mostra que 70% dos clientes passam pela entrada direita, mas produtos premium estão na esquerda. Realocação pode aumentar exposição em 40%.',
      data_sources: ['Mapa de calor', 'Dados de vendas', 'Fluxo de movimento', 'Tempo de permanência'],
      expected_results: [
        'Aumento de 22% nas vendas de eletrônicos',
        'Melhor experiência de descoberta de produtos',
        'Redução do tempo de busca por itens populares'
      ],
      implementation_steps: [
        'Mapear produtos por rotatividade e margem',
        'Definir nova disposição baseada no fluxo',
        'Executar mudança durante horário de menor movimento',
        'Atualizar sinalização e preços'
      ],
      metrics_to_track: ['Vendas por área', 'Tempo de permanência', 'Taxa de conversão por seção'],
      status: 'new',
      timestamp: new Date(Date.now() - 15 * 60000)
    },
    {
      id: 'rec_3',
      category: 'marketing',
      title: 'Campanha Personalizada para Clientes VIP',
      description: 'Lançar ofertas exclusivas baseadas no perfil de compra dos clientes premium',
      priority: 'high',
      impact: { revenue: 35, efficiency: 12, satisfaction: 30 },
      confidence: 88,
      timeframe: 'Esta semana',
      effort: 'medium',
      reasoning: 'Segmento VIP representa 15% dos clientes mas 40% da receita. Taxa de resposta a ofertas personalizadas é 3x maior que campanhas gerais.',
      data_sources: ['Segmentação de clientes', 'Histórico de compras', 'Padrões de comportamento'],
      expected_results: [
        'Aumento de 35% na receita do segmento VIP',
        'Melhoria de 30% na satisfação e fidelidade',
        'ROI da campanha 4x superior às campanhas tradicionais'
      ],
      implementation_steps: [
        'Identificar produtos de interesse para cada VIP',
        'Criar ofertas personalizadas com desconto graduado',
        'Implementar entrega via app/email/SMS',
        'Acompanhar taxa de conversão em tempo real'
      ],
      metrics_to_track: ['Taxa de abertura', 'Taxa de conversão', 'Valor médio de compra VIP'],
      status: 'in_review',
      timestamp: new Date(Date.now() - 30 * 60000)
    },
    {
      id: 'rec_4',
      category: 'timing',
      title: 'Horário Ideal para Promoções Flash',
      description: 'Lançar ofertas relâmpago durante picos de fluxo identificados',
      priority: 'medium',
      impact: { revenue: 18, efficiency: 20, satisfaction: 5 },
      confidence: 79,
      timeframe: 'Próximos 3 dias',
      effort: 'low',
      reasoning: 'Dados mostram que promoções entre 14h30-15h30 têm conversão 45% maior. Público neste horário tem perfil mais impulsivo.',
      data_sources: ['Padrões de fluxo', 'Histórico de promoções', 'Comportamento de compra'],
      expected_results: [
        'Aumento de 18% na receita durante promoções',
        'Maior engajamento em horários de pico',
        'Otimização do timing de campanhas'
      ],
      implementation_steps: [
        'Definir produtos para promoção flash',
        'Configurar sistema para lançamento automático',
        'Criar alertas para equipe de vendas',
        'Monitorar performance em tempo real'
      ],
      metrics_to_track: ['Taxa de conversão por horário', 'Velocidade de venda', 'Engajamento'],
      status: 'accepted',
      timestamp: new Date(Date.now() - 45 * 60000)
    },
    {
      id: 'rec_5',
      category: 'customer_service',
      title: 'Atendimento Proativo para Navegadores',
      description: 'Abordar clientes que permanecem muito tempo sem comprar',
      priority: 'low',
      impact: { revenue: 12, efficiency: 15, satisfaction: 25 },
      confidence: 73,
      timeframe: 'Implementar gradualmente',
      effort: 'low',
      reasoning: 'IA identifica clientes que navegam >15min sem comprar. Abordagem proativa aumenta conversão em 12% neste segmento.',
      data_sources: ['Tempo de permanência', 'Padrões de movimento', 'Taxa de conversão'],
      expected_results: [
        'Conversão de 12% dos navegadores longos',
        'Melhoria na experiência do cliente',
        'Redução na taxa de abandono'
      ],
      implementation_steps: [
        'Treinar equipe para abordagem não invasiva',
        'Definir trigger automático após 15min',
        'Criar script de aproximação personalizada',
        'Medir impacto na satisfação'
      ],
      metrics_to_track: ['Taxa de conversão de navegadores', 'Tempo de permanência', 'Feedback de clientes'],
      status: 'implemented',
      feedback: 'positive',
      timestamp: new Date(Date.now() - 60 * 60000)
    },
    {
      id: 'rec_6',
      category: 'inventory',
      title: 'Ajuste de Estoque Baseado em Predições',
      description: 'Aumentar estoque de produtos com alta probabilidade de demanda',
      priority: 'medium',
      impact: { revenue: 20, efficiency: 30, satisfaction: 10 },
      confidence: 91,
      timeframe: 'Próxima reposição',
      effort: 'medium',
      reasoning: 'Modelo preditivo indica aumento de 40% na demanda por eletrônicos na próxima semana, mas estoque atual cobrirá apenas 60% da demanda.',
      data_sources: ['Predições de demanda', 'Estoque atual', 'Sazonalidade', 'Tendências'],
      expected_results: [
        'Redução de 80% em produtos em falta',
        'Aumento de 20% nas vendas por disponibilidade',
        'Otimização de 30% no giro de estoque'
      ],
      implementation_steps: [
        'Revisar predições semanais da IA',
        'Calcular necessidade adicional de estoque',
        'Fazer pedidos antecipados para fornecedores',
        'Monitorar acurácia das predições'
      ],
      metrics_to_track: ['Taxa de ruptura', 'Giro de estoque', 'Acurácia das predições'],
      status: 'rejected',
      feedback: 'negative',
      timestamp: new Date(Date.now() - 90 * 60000)
    }
  ]
  
  const categories: RecommendationCategory[] = [
    { id: 'staff', name: 'Pessoal', icon: Users, color: '#3b82f6', count: 0 },
    { id: 'layout', name: 'Layout', icon: MapPin, color: '#10b981', count: 0 },
    { id: 'marketing', name: 'Marketing', icon: Target, color: '#f59e0b', count: 0 },
    { id: 'inventory', name: 'Estoque', icon: ShoppingBag, color: '#8b5cf6', count: 0 },
    { id: 'timing', name: 'Timing', icon: Clock, color: '#ef4444', count: 0 },
    { id: 'customer_service', name: 'Atendimento', icon: Award, color: '#06b6d4', count: 0 }
  ]
  
  const [recommendations, setRecommendations] = useState(generateRecommendations())
  
  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedCategory !== 'all' && rec.category !== selectedCategory) return false
    if (selectedPriority !== 'all' && rec.priority !== selectedPriority) return false
    if (selectedStatus !== 'all' && rec.status !== selectedStatus) return false
    return true
  })
  
  const handleAction = (id: string, action: 'accept' | 'reject' | 'implement') => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === id ? { 
        ...rec, 
        status: action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'implemented' 
      } : rec
    ))
    onRecommendationAction?.(id, action)
  }
  
  const handleFeedback = (id: string, feedback: 'positive' | 'negative') => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === id ? { ...rec, feedback } : rec
    ))
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20'
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/20'
      case 'low': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950/20'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500'
      case 'in_review': return 'bg-orange-500'
      case 'accepted': return 'bg-green-500'
      case 'implemented': return 'bg-purple-500'
      case 'rejected': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }
  
  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-orange-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }
  
  const newRecommendations = recommendations.filter(r => r.status === 'new').length
  const implementedRecommendations = recommendations.filter(r => r.status === 'implemented').length
  const averageConfidence = Math.round(
    recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length
  )

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-500" />
            <div>
              <h3 className="text-lg font-semibold">Recomendações da IA</h3>
              <p className="text-sm text-muted-foreground">
                Insights inteligentes para otimizar suas operações
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toda Prioridade</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="new">Novas</SelectItem>
                <SelectItem value="in_review">Em Análise</SelectItem>
                <SelectItem value="accepted">Aceitas</SelectItem>
                <SelectItem value="implemented">Implementadas</SelectItem>
                <SelectItem value="rejected">Rejeitadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-blue-600 text-sm font-medium">Novas</p>
                <p className="text-2xl font-bold text-blue-700">{newRecommendations}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-purple-500" />
              <div>
                <p className="text-purple-600 text-sm font-medium">Implementadas</p>
                <p className="text-2xl font-bold text-purple-700">{implementedRecommendations}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-green-600 text-sm font-medium">Confiança Média</p>
                <p className="text-2xl font-bold text-green-700">{averageConfidence}%</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-orange-500" />
              <div>
                <p className="text-orange-600 text-sm font-medium">Impacto Potencial</p>
                <p className="text-2xl font-bold text-orange-700">+{Math.round(
                  recommendations.reduce((sum, r) => sum + r.impact.revenue, 0) / recommendations.length
                )}%</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((category) => {
            const count = recommendations.filter(r => r.category === category.id).length
            const Icon = category.icon
            
            return (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.02 }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedCategory === category.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.id ? 'all' : category.id
                )}
              >
                <div className="text-center">
                  <Icon className="w-6 h-6 mx-auto mb-2" style={{ color: category.color }} />
                  <h4 className="font-medium text-sm">{category.name}</h4>
                  <p className="text-xs text-muted-foreground">{count} recomendações</p>
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {/* Recommendations List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredRecommendations.map((rec) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 border rounded-lg bg-background"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getStatusColor(rec.status) }}
                      ></div>
                      <h4 className="font-semibold">{rec.title}</h4>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                      <Badge variant="outline">
                        {categories.find(c => c.id === rec.category)?.name}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {rec.description}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Confiança:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={rec.confidence} className="flex-1 h-2" />
                          <span className="font-medium">{rec.confidence}%</span>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-muted-foreground">Impacto Receita:</span>
                        <p className="font-medium text-green-600">+{rec.impact.revenue}%</p>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-muted-foreground">Esforço:</span>
                        <p className={`font-medium ${getEffortColor(rec.effort)}`}>
                          {rec.effort === 'low' ? 'Baixo' : rec.effort === 'medium' ? 'Médio' : 'Alto'}
                        </p>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-muted-foreground">Prazo:</span>
                        <p className="font-medium">{rec.timeframe}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Eficiência: +{rec.impact.efficiency}%</span>
                      <span>Satisfação: +{rec.impact.satisfaction}%</span>
                      <span>{rec.timestamp.toLocaleString('pt-BR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    {rec.status === 'new' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAction(rec.id, 'accept')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aceitar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(rec.id, 'reject')}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rejeitar
                        </Button>
                      </>
                    )}
                    
                    {rec.status === 'accepted' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAction(rec.id, 'implement')}
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        Implementar
                      </Button>
                    )}
                    
                    {rec.status === 'implemented' && !rec.feedback && (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFeedback(rec.id, 'positive')}
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFeedback(rec.id, 'negative')}
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
                    >
                      {expandedRec === rec.id ? 'Menos' : 'Mais'}
                    </Button>
                  </div>
                </div>
                
                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedRec === rec.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-border/50"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium text-sm mb-2">Análise da IA</h5>
                            <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-sm mb-2">Fontes de Dados</h5>
                            <div className="flex flex-wrap gap-1">
                              {rec.data_sources.map((source, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {source}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-sm mb-2">Resultados Esperados</h5>
                            <div className="space-y-1">
                              {rec.expected_results.map((result, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>
                                  <span>{result}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium text-sm mb-2">Passos de Implementação</h5>
                            <div className="space-y-2">
                              {rec.implementation_steps.map((step, index) => (
                                <div key={index} className="flex items-start gap-3 text-sm">
                                  <div className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center mt-0.5">
                                    {index + 1}
                                  </div>
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-sm mb-2">Métricas de Acompanhamento</h5>
                            <div className="space-y-1">
                              {rec.metrics_to_track.map((metric, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <Target className="w-3 h-3 text-muted-foreground" />
                                  <span>{metric}</span>
                                </div>
                              ))}
                            </div>
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
        
        {filteredRecommendations.length === 0 && (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-medium mb-2">Nenhuma Recomendação Encontrada</h4>
            <p className="text-sm text-muted-foreground">
              Tente ajustar os filtros ou aguarde novas análises da IA
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}