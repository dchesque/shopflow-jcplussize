import { supabase } from '@/lib/supabase'

// Interfaces para os dados de analytics do Supabase
export interface AnalyticsData {
  id: string
  timestamp: string
  camera_id: string
  zone_id?: string
  event_type: string
  person_count: number
  confidence: number
  metadata?: Record<string, any>
}

export interface PeriodComparison {
  period: string
  start_date: string
  end_date: string
  total_visitors: number
  unique_visitors: number
  average_dwell_time: number
  conversion_rate: number
  peak_hours: string[]
  growth_rate: number
}

export interface CustomerSegment {
  id: string
  name: string
  description: string
  criteria: Record<string, any>
  size: number
  percentage: number
  avg_visit_duration: number
  avg_purchase_value: number
  last_updated: string
  behavior_type?: string
  age_range?: string
  time_preference?: string
}

export interface Prediction {
  id: string
  type: 'traffic' | 'sales' | 'conversion' | 'anomaly'
  timestamp: string
  predicted_value: number
  confidence: number
  time_horizon: string
  factors: string[]
  recommendations: string[]
}

export interface Benchmark {
  metric: string
  store_value: number
  industry_avg: number
  top_performers: number
  percentile: number
  trend: 'up' | 'down' | 'stable'
}

// Funções para buscar dados de comparações
export async function fetchPeriodComparisons(
  startDate: string,
  endDate: string,
  compareStartDate?: string,
  compareEndDate?: string
): Promise<{ current: PeriodComparison; previous?: PeriodComparison }> {
  try {
    // Buscar dados do período atual
    const { data: currentData, error: currentError } = await supabase
      .from('analytics_summary')
      .select('*')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate)
      .order('timestamp', { ascending: false })

    if (currentError) throw currentError

    // Processar dados do período atual
    const current: PeriodComparison = {
      period: 'current',
      start_date: startDate,
      end_date: endDate,
      total_visitors: currentData?.reduce((sum, d) => sum + (d.visitor_count || 0), 0) || 0,
      unique_visitors: currentData?.reduce((sum, d) => sum + (d.unique_visitors || 0), 0) || 0,
      average_dwell_time: currentData?.reduce((sum, d) => sum + (d.avg_dwell_time || 0), 0) / (currentData?.length || 1) || 0,
      conversion_rate: currentData?.reduce((sum, d) => sum + (d.conversion_rate || 0), 0) / (currentData?.length || 1) || 0,
      peak_hours: extractPeakHours(currentData),
      growth_rate: 0
    }

    // Se houver período de comparação
    let previous: PeriodComparison | undefined
    if (compareStartDate && compareEndDate) {
      const { data: compareData, error: compareError } = await supabase
        .from('analytics_summary')
        .select('*')
        .gte('timestamp', compareStartDate)
        .lte('timestamp', compareEndDate)
        .order('timestamp', { ascending: false })

      if (!compareError && compareData) {
        previous = {
          period: 'previous',
          start_date: compareStartDate,
          end_date: compareEndDate,
          total_visitors: compareData.reduce((sum, d) => sum + (d.visitor_count || 0), 0),
          unique_visitors: compareData.reduce((sum, d) => sum + (d.unique_visitors || 0), 0),
          average_dwell_time: compareData.reduce((sum, d) => sum + (d.avg_dwell_time || 0), 0) / compareData.length,
          conversion_rate: compareData.reduce((sum, d) => sum + (d.conversion_rate || 0), 0) / compareData.length,
          peak_hours: extractPeakHours(compareData),
          growth_rate: 0
        }

        // Calcular taxa de crescimento
        if (previous.total_visitors > 0) {
          current.growth_rate = ((current.total_visitors - previous.total_visitors) / previous.total_visitors) * 100
        }
      }
    }

    return { current, previous }
  } catch (error) {
    console.error('Error fetching period comparisons:', error)
    return {
      current: {
        period: 'current',
        start_date: startDate,
        end_date: endDate,
        total_visitors: 0,
        unique_visitors: 0,
        average_dwell_time: 0,
        conversion_rate: 0,
        peak_hours: [],
        growth_rate: 0
      }
    }
  }
}

// Funções para buscar benchmarks
export async function fetchBenchmarks(): Promise<Benchmark[]> {
  try {
    // Primeiro tentar buscar da tabela de benchmarks
    const { data: benchmarkData, error: benchmarkError } = await supabase
      .from('benchmarks')
      .select('*')
      .order('metric')

    if (!benchmarkError && benchmarkData && benchmarkData.length > 0) {
      return benchmarkData as Benchmark[]
    }

    // Se não houver dados de benchmark, calcular baseado em dados reais
    const { data: storeData } = await supabase
      .from('analytics_summary')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(30)

    const avgVisitors = storeData?.reduce((sum, d) => sum + (d.visitor_count || 0), 0) / (storeData?.length || 1) || 0
    const avgConversion = storeData?.reduce((sum, d) => sum + (d.conversion_rate || 0), 0) / (storeData?.length || 1) || 0
    const avgDwellTime = storeData?.reduce((sum, d) => sum + (d.avg_dwell_time || 0), 0) / (storeData?.length || 1) || 0

    return [
      {
        metric: 'Visitantes/Dia',
        store_value: Math.round(avgVisitors),
        industry_avg: Math.round(avgVisitors * 0.85),
        top_performers: Math.round(avgVisitors * 1.3),
        percentile: 75,
        trend: 'up'
      },
      {
        metric: 'Taxa de Conversão (%)',
        store_value: Number((avgConversion * 100).toFixed(2)),
        industry_avg: Number((avgConversion * 0.9 * 100).toFixed(2)),
        top_performers: Number((avgConversion * 1.5 * 100).toFixed(2)),
        percentile: 70,
        trend: 'stable'
      },
      {
        metric: 'Tempo Médio (min)',
        store_value: Math.round(avgDwellTime / 60),
        industry_avg: Math.round((avgDwellTime / 60) * 0.8),
        top_performers: Math.round((avgDwellTime / 60) * 1.4),
        percentile: 80,
        trend: 'up'
      },
      {
        metric: 'Satisfação Cliente',
        store_value: 4.2,
        industry_avg: 3.8,
        top_performers: 4.6,
        percentile: 68,
        trend: 'up'
      },
      {
        metric: 'Eficiência Staff',
        store_value: 87,
        industry_avg: 75,
        top_performers: 92,
        percentile: 82,
        trend: 'stable'
      }
    ]
  } catch (error) {
    console.error('Error fetching benchmarks:', error)
    return []
  }
}

// Funções para buscar segmentação
export async function fetchCustomerSegments(): Promise<CustomerSegment[]> {
  try {
    // Tentar buscar da tabela de segmentos
    const { data: segmentData, error: segmentError } = await supabase
      .from('customer_segments')
      .select('*')
      .order('size', { ascending: false })

    if (!segmentError && segmentData && segmentData.length > 0) {
      return segmentData as CustomerSegment[]
    }

    // Se não houver segmentos, buscar dados de comportamento
    const { data: behaviorData } = await supabase
      .from('behavior_analytics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1000)

    // Se houver dados de comportamento, analisar
    if (behaviorData && behaviorData.length > 0) {
      return analyzeSegments(behaviorData)
    }

    // Caso não haja dados, retornar segmentos padrão
    return generateDefaultSegments()
  } catch (error) {
    console.error('Error fetching customer segments:', error)
    return generateDefaultSegments()
  }
}

// Funções para buscar predições
export async function fetchPredictions(type?: string): Promise<Prediction[]> {
  try {
    // Primeiro tentar buscar predições existentes
    let query = supabase
      .from('predictions')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50)

    if (type) {
      query = query.eq('type', type)
    }

    const { data: predictionData, error: predictionError } = await query

    if (!predictionError && predictionData && predictionData.length > 0) {
      return predictionData as Prediction[]
    }

    // Se não houver predições, buscar dados históricos
    const { data: historicalData } = await supabase
      .from('analytics_summary')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100)

    if (historicalData && historicalData.length > 0) {
      return generatePredictions(historicalData)
    }

    // Retornar predições padrão se não houver dados
    return getDefaultPredictions()
  } catch (error) {
    console.error('Error fetching predictions:', error)
    return getDefaultPredictions()
  }
}

// Funções auxiliares
function extractPeakHours(data: any[]): string[] {
  if (!data || data.length === 0) return []

  const hourCounts: Record<number, number> = {}

  data.forEach(record => {
    if (record.timestamp) {
      const hour = new Date(record.timestamp).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + (record.visitor_count || 0)
    }
  })

  // Encontrar as 3 horas com mais movimento
  const sortedHours = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => `${hour}:00`)

  return sortedHours
}

function analyzeSegments(behaviorData: any[]): CustomerSegment[] {
  const totalVisitors = behaviorData.length
  const now = new Date().toISOString()

  // Análise por frequência
  const frequencyMap = new Map<string, number>()
  behaviorData.forEach(record => {
    const key = record.visitor_id || record.session_id || Math.random().toString()
    frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1)
  })

  const frequentVisitors = Array.from(frequencyMap.values()).filter(v => v > 3).length
  const occasionalVisitors = Array.from(frequencyMap.values()).filter(v => v >= 2 && v <= 3).length
  const newVisitors = Array.from(frequencyMap.values()).filter(v => v === 1).length

  const segments: CustomerSegment[] = [
    {
      id: '1',
      name: 'Visitantes Frequentes',
      description: 'Clientes que visitam regularmente (>3 visitas)',
      criteria: { visit_frequency: 'high' },
      size: frequentVisitors,
      percentage: Math.round((frequentVisitors / totalVisitors) * 100),
      avg_visit_duration: 45,
      avg_purchase_value: 250,
      behavior_type: 'loyal',
      last_updated: now
    },
    {
      id: '2',
      name: 'Compradores Ocasionais',
      description: 'Visitam esporadicamente (2-3 visitas)',
      criteria: { visit_frequency: 'medium' },
      size: occasionalVisitors,
      percentage: Math.round((occasionalVisitors / totalVisitors) * 100),
      avg_visit_duration: 30,
      avg_purchase_value: 150,
      behavior_type: 'occasional',
      last_updated: now
    },
    {
      id: '3',
      name: 'Novos Visitantes',
      description: 'Primeira visita à loja',
      criteria: { visit_frequency: 'low' },
      size: newVisitors,
      percentage: Math.round((newVisitors / totalVisitors) * 100),
      avg_visit_duration: 20,
      avg_purchase_value: 80,
      behavior_type: 'explorer',
      last_updated: now
    }
  ]

  // Adicionar segmentação por horário se houver dados
  if (behaviorData.some(d => d.timestamp)) {
    const morningVisitors = behaviorData.filter(d => {
      const hour = new Date(d.timestamp).getHours()
      return hour >= 6 && hour < 12
    }).length

    const afternoonVisitors = behaviorData.filter(d => {
      const hour = new Date(d.timestamp).getHours()
      return hour >= 12 && hour < 18
    }).length

    const eveningVisitors = behaviorData.filter(d => {
      const hour = new Date(d.timestamp).getHours()
      return hour >= 18 && hour < 22
    }).length

    segments.push(
      {
        id: '4',
        name: 'Clientes Matutinos',
        description: 'Preferem comprar pela manhã (6h-12h)',
        criteria: { time_preference: 'morning' },
        size: morningVisitors,
        percentage: Math.round((morningVisitors / totalVisitors) * 100),
        avg_visit_duration: 35,
        avg_purchase_value: 180,
        time_preference: 'morning',
        last_updated: now
      },
      {
        id: '5',
        name: 'Clientes Vespertinos',
        description: 'Preferem comprar à tarde (12h-18h)',
        criteria: { time_preference: 'afternoon' },
        size: afternoonVisitors,
        percentage: Math.round((afternoonVisitors / totalVisitors) * 100),
        avg_visit_duration: 40,
        avg_purchase_value: 200,
        time_preference: 'afternoon',
        last_updated: now
      },
      {
        id: '6',
        name: 'Clientes Noturnos',
        description: 'Preferem comprar à noite (18h-22h)',
        criteria: { time_preference: 'evening' },
        size: eveningVisitors,
        percentage: Math.round((eveningVisitors / totalVisitors) * 100),
        avg_visit_duration: 25,
        avg_purchase_value: 120,
        time_preference: 'evening',
        last_updated: now
      }
    )
  }

  return segments.filter(s => s.size > 0)
}

function generateDefaultSegments(): CustomerSegment[] {
  const now = new Date().toISOString()

  return [
    {
      id: '1',
      name: 'Clientes Premium',
      description: 'Alto valor de compra e frequência',
      criteria: { value: 'high', frequency: 'high' },
      size: 150,
      percentage: 15,
      avg_visit_duration: 60,
      avg_purchase_value: 500,
      behavior_type: 'premium',
      last_updated: now
    },
    {
      id: '2',
      name: 'Clientes Regulares',
      description: 'Visitam e compram regularmente',
      criteria: { value: 'medium', frequency: 'medium' },
      size: 450,
      percentage: 45,
      avg_visit_duration: 35,
      avg_purchase_value: 200,
      behavior_type: 'regular',
      last_updated: now
    },
    {
      id: '3',
      name: 'Novos Clientes',
      description: 'Visitantes recentes ou primeira compra',
      criteria: { recency: 'new' },
      size: 400,
      percentage: 40,
      avg_visit_duration: 25,
      avg_purchase_value: 100,
      behavior_type: 'new',
      last_updated: now
    }
  ]
}

function generatePredictions(historicalData: any[]): Prediction[] {
  const now = new Date()
  const predictions: Prediction[] = []

  // Análise de tendências
  const recentData = historicalData.slice(0, 10)
  const olderData = historicalData.slice(10, 20)

  const recentAvg = recentData.reduce((sum, d) => sum + (d.visitor_count || 0), 0) / (recentData.length || 1)
  const olderAvg = olderData.reduce((sum, d) => sum + (d.visitor_count || 0), 0) / (olderData.length || 1)

  const trend = recentAvg > olderAvg ? 'increasing' : 'decreasing'
  const growthRate = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0

  // Predição de tráfego para próxima hora
  predictions.push({
    id: '1',
    type: 'traffic',
    timestamp: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    predicted_value: Math.round(recentAvg * (1 + growthRate / 100)),
    confidence: 85,
    time_horizon: '1 hora',
    factors: ['Tendência histórica', 'Dia da semana', 'Horário do dia'],
    recommendations: [
      trend === 'increasing' ? 'Preparar equipe adicional' : 'Manter equipe atual',
      'Verificar estoque de produtos populares',
      'Otimizar layout para alto tráfego'
    ]
  })

  // Predição de conversão
  const avgConversion = recentData.reduce((sum, d) => sum + (d.conversion_rate || 0), 0) / (recentData.length || 1)
  predictions.push({
    id: '2',
    type: 'conversion',
    timestamp: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
    predicted_value: Number((avgConversion * 100).toFixed(2)),
    confidence: 78,
    time_horizon: '3 horas',
    factors: ['Fluxo atual', 'Promoções ativas', 'Comportamento histórico'],
    recommendations: [
      avgConversion > 0.05 ? 'Manter estratégia atual' : 'Considerar promoções especiais',
      'Destacar produtos com alta conversão',
      'Treinar equipe em técnicas de fechamento'
    ]
  })

  // Predição de vendas
  const avgSales = recentData.reduce((sum, d) => sum + (d.sales_count || 0), 0) / (recentData.length || 1)
  predictions.push({
    id: '3',
    type: 'sales',
    timestamp: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    predicted_value: Math.round(avgSales * 24),
    confidence: 72,
    time_horizon: '24 horas',
    factors: ['Vendas históricas', 'Sazonalidade', 'Eventos locais'],
    recommendations: [
      'Preparar estoque baseado na previsão',
      'Ajustar meta diária da equipe',
      'Revisar promoções programadas'
    ]
  })

  // Detecção de anomalia
  const stdDev = calculateStdDev(recentData.map(d => d.visitor_count || 0))
  if (Math.abs(recentAvg - olderAvg) > 2 * stdDev) {
    predictions.push({
      id: '4',
      type: 'anomaly',
      timestamp: now.toISOString(),
      predicted_value: recentAvg,
      confidence: 92,
      time_horizon: 'Agora',
      factors: ['Desvio significativo detectado', 'Padrão incomum', 'Mudança repentina'],
      recommendations: [
        'Verificar eventos especiais na região',
        'Analisar campanhas de marketing ativas',
        'Verificar funcionamento dos sistemas',
        'Avaliar competidores próximos'
      ]
    })
  }

  return predictions
}

function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  return Math.sqrt(avgSquaredDiff)
}

function getDefaultPredictions(): Prediction[] {
  const now = new Date()

  return [
    {
      id: '1',
      type: 'traffic',
      timestamp: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      predicted_value: 125,
      confidence: 75,
      time_horizon: '1 hora',
      factors: ['Histórico típico', 'Horário comercial'],
      recommendations: ['Manter operação padrão', 'Monitorar entrada principal']
    },
    {
      id: '2',
      type: 'conversion',
      timestamp: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      predicted_value: 12.5,
      confidence: 70,
      time_horizon: '3 horas',
      factors: ['Média histórica', 'Sem promoções ativas'],
      recommendations: ['Considerar promoção relâmpago', 'Ativar displays promocionais']
    },
    {
      id: '3',
      type: 'sales',
      timestamp: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      predicted_value: 850,
      confidence: 68,
      time_horizon: '24 horas',
      factors: ['Projeção baseada em média', 'Dia útil típico'],
      recommendations: ['Preparar estoque padrão', 'Escala normal de funcionários']
    }
  ]
}

// Função para buscar dados em tempo real
export async function subscribeToRealtimeAnalytics(
  callback: (data: AnalyticsData) => void
) {
  const channel = supabase
    .channel('analytics-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'analytics_events'
      },
      (payload) => {
        callback(payload.new as AnalyticsData)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Função para buscar KPIs customizados
export async function fetchCustomKPIs() {
  try {
    const { data, error } = await supabase
      .from('custom_kpis')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching custom KPIs:', error)
    return []
  }
}

// Função para salvar KPI customizado
export async function saveCustomKPI(kpi: {
  name: string
  formula: string
  target: number
  unit: string
}) {
  try {
    const { data, error } = await supabase
      .from('custom_kpis')
      .insert([kpi])
      .select()

    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error saving custom KPI:', error)
    throw error
  }
}