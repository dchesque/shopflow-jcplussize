const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

export interface AnalyticsResponse<T = any> {
  status: string
  data: T
  message?: string
}

export interface SmartMetrics {
  counting: {
    total_people: number
    customers: number
    employees: number
    confidence_score: number
  }
  behavior: {
    avg_dwell_time: number
    hot_zones: Array<{ zone: string; intensity: number; visits: number }>
    flow_pattern: string
    group_shopping_rate: number
  }
  segmentation: Record<string, number>
  predictions: {
    next_hour: number
    conversion_probability: number
    optimal_staff: number
  }
  insights: {
    anomalies: string[]
    recommendations: string[]
  }
  metadata: {
    timestamp: string
    ai_enabled: boolean
  }
}

export interface RealtimeData {
  current_metrics: {
    people_online: number
    avg_time_spent: string
    conversion_rate: number
    active_alerts: number
  }
  hourly_trend: Array<{ hour: string; count: number }>
  recent_activities: Array<{
    id: number
    type: string
    message: string
    timestamp: string
    severity: string
  }>
  active_alerts: Array<{
    id: number
    type: string
    title: string
    message: string
    timestamp: string
  }>
}

export interface FlowVisualizationData {
  heatmap_zones: Array<{
    zone: string
    x: number
    y: number
    intensity: number
    visits: number
  }>
  main_paths: Array<{
    path_id: number
    name: string
    frequency: number
    avg_time: string
    conversion_rate: number
    coordinates: Array<{ x: number; y: number }>
  }>
  bottlenecks: Array<{
    zone: string
    severity: string
    avg_wait_time: string
    recommendation: string
  }>
  period_stats: {
    total_visitors: number
    unique_paths: number
    avg_visit_duration: string
    busiest_hour: string
  }
}

export interface GroupAnalysisData {
  group_size_distribution: Array<{
    size: number | string
    count: number
    percentage: number
    avg_spending: number
  }>
  group_behavior_patterns: Array<{
    pattern: string
    description: string
    frequency: number
    characteristics: string[]
    conversion_rate: number
  }>
  optimal_strategies: Array<{
    group_type: string
    recommendation: string
    impact: string
  }>
  time_analysis: {
    peak_group_hours: string[]
    solo_shopper_hours: string[]
    weekend_vs_weekday: {
      weekend_group_ratio: number
      weekday_group_ratio: number
    }
  }
}

export interface PeriodComparisonData {
  current_period: {
    visitors: number
    sales: number
    revenue: number
    conversion_rate: number
    avg_time_spent: string
    peak_hour: string
  }
  comparison_period: {
    visitors: number
    sales: number
    revenue: number
    conversion_rate: number
    avg_time_spent: string
    peak_hour: string
  }
  variations: Record<string, {
    absolute: number
    percentage: number
    trend: string
  }>
  insights: Array<{
    type: string
    title: string
    description: string
    impact: string
  }>
  statistical_significance: {
    confidence_level: number
    is_significant: boolean
    p_value: number
  }
}

export interface BenchmarkData {
  industry_averages: Record<string, {
    value: number | string
    percentile: number
  }>
  store_performance: Record<string, {
    value: number | string
    percentile: number
    status: string
  }>
  top_performers: Record<string, {
    value: number | string
    percentile: number
  }>
  improvement_opportunities: Array<{
    metric: string
    current_percentile: number
    target_percentile: number
    potential_impact: string
    recommended_actions: string[]
  }>
  market_context: {
    industry: string
    store_size: string
    region: string
    sample_size: number
    data_freshness: string
  }
}

class AnalyticsAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<AnalyticsResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Smart Analytics
  async getSmartMetrics(): Promise<AnalyticsResponse<SmartMetrics>> {
    return this.request<SmartMetrics>('/api/analytics/smart-metrics')
  }

  async getBehaviorPatterns(dateFilter?: string, hours: number = 24): Promise<AnalyticsResponse> {
    const params = new URLSearchParams({ hours: hours.toString() })
    if (dateFilter) {
      params.append('date_filter', dateFilter)
    }
    return this.request(`/api/analytics/behavior-patterns?${params.toString()}`)
  }

  async getPredictions(predictionType?: string): Promise<AnalyticsResponse> {
    const params = predictionType ? `?prediction_type=${predictionType}` : ''
    return this.request(`/api/analytics/predictions${params}`)
  }

  async getCustomerSegmentation(days: number = 30): Promise<AnalyticsResponse> {
    return this.request(`/api/analytics/segmentation?days=${days}`)
  }

  // Real-time Analytics
  async getRealtimeData(): Promise<AnalyticsResponse<RealtimeData>> {
    return this.request<RealtimeData>('/api/analytics/realtime-data')
  }

  // Flow Visualization
  async getFlowVisualization(hours: number = 24): Promise<AnalyticsResponse<FlowVisualizationData>> {
    return this.request<FlowVisualizationData>(`/api/analytics/flow-visualization?hours=${hours}`)
  }

  // Group Analysis
  async getGroupAnalysis(days: number = 7): Promise<AnalyticsResponse<GroupAnalysisData>> {
    return this.request<GroupAnalysisData>(`/api/analytics/group-analysis?days=${days}`)
  }

  // Period Comparison
  async getPeriodComparison(
    currentPeriod: string,
    comparisonPeriod: string
  ): Promise<AnalyticsResponse<PeriodComparisonData>> {
    const params = new URLSearchParams({
      current_period: currentPeriod,
      comparison_period: comparisonPeriod,
    })
    return this.request<PeriodComparisonData>(`/api/analytics/period-comparison?${params.toString()}`)
  }

  // Benchmarks
  async getBenchmarks(
    industry: string = 'retail',
    storeSize: string = 'medium'
  ): Promise<AnalyticsResponse<BenchmarkData>> {
    const params = new URLSearchParams({
      industry,
      store_size: storeSize,
    })
    return this.request<BenchmarkData>(`/api/analytics/benchmarks?${params.toString()}`)
  }

  // System Health
  async getAnalyticsHealth(): Promise<AnalyticsResponse> {
    return this.request('/api/analytics/health')
  }

  async getAnalyticsSummary(): Promise<AnalyticsResponse> {
    return this.request('/api/analytics/summary')
  }
}

export const analyticsAPI = new AnalyticsAPI()
export default analyticsAPI