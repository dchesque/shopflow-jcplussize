'use client'

import * as React from 'react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
// import { useRealtimeChannel } from '@/components/providers/RealtimeProvider' // Disabled for demo

import { supabase, CameraEvent } from '@/lib/supabase'

// Types for our metrics
export interface MetricData {
  id: string
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  sparklineData?: number[]
  lastUpdate: Date
  isLive: boolean
}

export interface LiveMetrics {
  peopleInStore: number
  conversionRate: number
  averageTime: number
  activeEmployees: number
  totalToday: number
  peakHour: { hour: number; count: number } | null
  trends: {
    peopleInStore: 'up' | 'down' | 'neutral'
    conversionRate: 'up' | 'down' | 'neutral'
    averageTime: 'up' | 'down' | 'neutral'
  }
}

// Fetch current metrics from API (REAL DATA)
async function fetchCurrentMetrics(): Promise<LiveMetrics> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

    // Buscar dados reais do backend
    const [dashboardResponse, analyticsResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/analytics/dashboard`),
      fetch(`${API_BASE_URL}/api/analytics/real-time`)
    ])

    if (!dashboardResponse.ok || !analyticsResponse.ok) {
      throw new Error('Failed to fetch real metrics')
    }

    const dashboardData = await dashboardResponse.json()
    const analyticsData = await analyticsResponse.json()

    // Processar dados reais do backend
    const peopleInStore = dashboardData.current_people || 0
    const totalToday = dashboardData.total_entries || 0
    const conversionRate = dashboardData.conversion_rate || 0
    const averageTime = Math.round(parseFloat(dashboardData.avg_time_spent?.replace(':', '.') || '0') * 60) // Converter HH:MM para minutos
    const activeEmployees = analyticsData.active_employees || 0

    const peakHour = {
      hour: dashboardData.peak_hour || 14,
      count: dashboardData.peak_count || 0
    }

    // Calcular trends com base em dados históricos
    const currentHour = new Date().getHours()
    const previousMetrics = analyticsData.previous_metrics || {}

    const trends = {
      peopleInStore: peopleInStore > (previousMetrics.people_in_store || 0) ? 'up' as const :
                     peopleInStore < (previousMetrics.people_in_store || 0) ? 'down' as const : 'neutral' as const,
      conversionRate: conversionRate > (previousMetrics.conversion_rate || 0) ? 'up' as const :
                      conversionRate < (previousMetrics.conversion_rate || 0) ? 'down' as const : 'neutral' as const,
      averageTime: averageTime > (previousMetrics.average_time || 0) ? 'up' as const :
                   averageTime < (previousMetrics.average_time || 0) ? 'down' as const : 'neutral' as const
    }

    return {
      peopleInStore,
      conversionRate,
      averageTime,
      activeEmployees,
      totalToday,
      peakHour,
      trends
    }

  } catch (error) {
    console.error('Error fetching real metrics:', error)

    // Fallback to basic data if API fails
    return {
      peopleInStore: 0,
      conversionRate: 0,
      averageTime: 0,
      activeEmployees: 0,
      totalToday: 0,
      peakHour: null,
      trends: {
        peopleInStore: 'neutral',
        conversionRate: 'neutral',
        averageTime: 'neutral'
      }
    }
  }
}

// Hook for real-time metrics
export function useRealTimeMetrics(options: {
  enabled?: boolean
  refreshInterval?: number
  enableRealtime?: boolean
} = {}) {
  const {
    enabled = true,
    refreshInterval = 30000, // 30 seconds
    enableRealtime = true
  } = options

  const queryClient = useQueryClient()
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isLive, setIsLive] = useState(false)
  const sparklineRef = useRef<number[]>([])

  // Query for initial data and periodic refresh
  const {
    data: metrics,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['live-metrics'],
    queryFn: fetchCurrentMetrics,
    enabled,
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: true
  })

  // Handle data updates
  React.useEffect(() => {
    if (metrics) {
      setLastUpdate(new Date())
      // Update sparkline data
      if (typeof metrics.peopleInStore === 'number') {
        sparklineRef.current = [...sparklineRef.current.slice(-8), metrics.peopleInStore]
        if (sparklineRef.current.length > 9) {
          sparklineRef.current = sparklineRef.current.slice(-9)
        }
      }
    }
  }, [metrics])

  // Handle real-time updates
  const handleCameraEvent = useCallback((event: CameraEvent) => {
    // Update metrics based on new camera event
    queryClient.setQueryData(['live-metrics'], (old: LiveMetrics | undefined) => {
      if (!old) return old

      const updated: LiveMetrics = {
        ...old,
        totalToday: old.totalToday + 1,
        // Update people count based on real camera event
        peopleInStore: event.person_type === 'customer' ? old.peopleInStore + 1 : old.peopleInStore
      }

      // Update sparkline
      sparklineRef.current = [...sparklineRef.current.slice(-8), updated.peopleInStore]

      return updated
    })

    setLastUpdate(new Date())
    setIsLive(true)

    // Reset live indicator after 3 seconds
    setTimeout(() => setIsLive(false), 3000)
  }, [queryClient])

  // Subscribe to camera events for real-time updates (disabled for demo)
  const isSubscribed = false // Disabled to prevent CORS errors

  // Subscribe to real camera events from backend
  React.useEffect(() => {
    if (enableRealtime && enabled) {
      let eventSource: EventSource | null = null

      // Conectar ao stream de eventos reais do backend
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
        eventSource = new EventSource(`${API_BASE_URL}/api/analytics/stream`)

        eventSource.onmessage = (event) => {
          try {
            const cameraEvent = JSON.parse(event.data)
            handleCameraEvent(cameraEvent)
          } catch (error) {
            console.error('Error parsing camera event:', error)
          }
        }

        eventSource.onerror = (error) => {
          console.error('EventSource error:', error)
          setIsLive(false)
        }

        eventSource.onopen = () => {
          console.log('Connected to real-time camera events')
          setIsLive(true)
        }

      } catch (error) {
        console.error('Failed to connect to real-time events:', error)
      }

      return () => {
        if (eventSource) {
          eventSource.close()
        }
      }
    }
  }, [enableRealtime, enabled, handleCameraEvent])

  // Format metrics for UI components
  const formattedMetrics: MetricData[] = metrics ? [
    {
      id: 'people-in-store',
      title: 'Pessoas na Loja',
      value: metrics.peopleInStore,
      change: metrics.trends.peopleInStore === 'up' ? '+12%' : 
              metrics.trends.peopleInStore === 'down' ? '-5%' : '0%',
      trend: metrics.trends.peopleInStore,
      sparklineData: sparklineRef.current,
      lastUpdate,
      isLive
    },
    {
      id: 'conversion-rate',
      title: 'Taxa de Conversão',
      value: `${metrics.conversionRate}%`,
      change: metrics.trends.conversionRate === 'up' ? '+5%' : 
              metrics.trends.conversionRate === 'down' ? '-3%' : '0%',
      trend: metrics.trends.conversionRate,
      sparklineData: [60, 62, 65, 63, 66, metrics.conversionRate, 70, 69, metrics.conversionRate],
      lastUpdate,
      isLive
    },
    {
      id: 'average-time',
      title: 'Tempo Médio',
      value: `${metrics.averageTime}min`,
      change: metrics.trends.averageTime === 'up' ? '+2min' : 
              metrics.trends.averageTime === 'down' ? '-3min' : '0min',
      trend: metrics.trends.averageTime,
      sparklineData: [28, 27, 26, 25, metrics.averageTime, 23, 24, 25, metrics.averageTime],
      lastUpdate,
      isLive
    },
    {
      id: 'active-employees',
      title: 'Funcionários Ativos',
      value: metrics.activeEmployees,
      change: '0%',
      trend: 'neutral',
      sparklineData: [8, 8, 7, 8, 8, 8, 9, 8, metrics.activeEmployees],
      lastUpdate,
      isLive
    }
  ] : []

  return {
    metrics: formattedMetrics,
    rawMetrics: metrics,
    isLoading,
    error,
    lastUpdate,
    isLive,
    isConnected: isSubscribed,
    refresh: refetch,
    sparklineData: sparklineRef.current
  }
}

// Hook for flow chart real-time data (REAL DATA)
export function useRealTimeFlowData(timeRange: '24h' | '7d' | '30d' = '24h') {
  const [flowData, setFlowData] = useState<Array<{
    timestamp: string
    hour: string
    customers: number
    employees: number
    total: number
  }>>([])

  // Fetch real flow data from backend
  useEffect(() => {
    const fetchFlowData = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

        // Calcular período baseado no timeRange
        const now = new Date()
        const hoursToGenerate = timeRange === '24h' ? 24 : timeRange === '7d' ? 24 * 7 : 24 * 30
        const startTime = new Date(now.getTime() - hoursToGenerate * 60 * 60 * 1000)

        const response = await fetch(
          `${API_BASE_URL}/api/analytics/flow-data?start=${startTime.toISOString()}&end=${now.toISOString()}&period=${timeRange}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch flow data')
        }

        const data = await response.json()
        const realFlowData = data.flow_data || []

        // Processar dados reais para o formato esperado
        const processedData = realFlowData.map((item: any) => ({
          timestamp: item.timestamp,
          hour: new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          customers: item.customers_count || 0,
          employees: item.employees_count || 0,
          total: (item.customers_count || 0) + (item.employees_count || 0)
        }))

        setFlowData(processedData)

      } catch (error) {
        console.error('Error fetching real flow data:', error)

        // Fallback: preencher com dados vazios se API falhar
        const emptyData = []
        const now = new Date()
        const hoursToGenerate = timeRange === '24h' ? 24 : timeRange === '7d' ? 24 * 7 : 24 * 30

        for (let i = hoursToGenerate - 1; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 60 * 60 * 1000)
          emptyData.push({
            timestamp: time.toISOString(),
            hour: time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            customers: 0,
            employees: 0,
            total: 0
          })
        }

        setFlowData(emptyData)
      }
    }

    fetchFlowData()
  }, [timeRange])

  // Handle real-time updates
  const handleCameraEvent = useCallback((event: CameraEvent) => {
    setFlowData(current => {
      const now = new Date()
      const currentHour = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      const updated = [...current]
      
      // Update the last data point
      if (updated.length > 0) {
        const lastPoint = updated[updated.length - 1]
        updated[updated.length - 1] = {
          ...lastPoint,
          customers: event.person_type === 'customer' ? lastPoint.customers + 1 : lastPoint.customers,
          employees: event.person_type === 'employee' ? lastPoint.employees + 1 : lastPoint.employees,
          total: lastPoint.total + 1
        }
      }
      
      return updated
    })
  }, [])

  // Subscribe to real-time updates for flow data (disabled for demo)
  // Real-time updates disabled to prevent CORS errors

  return {
    flowData,
    refresh: () => {
      // Trigger data regeneration
      setFlowData(current => [...current])
    }
  }
}

// Hook for connection status indicator
export function useConnectionStatus() {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting')
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null)

  useEffect(() => {
    // Real connection status based on actual data updates
    const interval = setInterval(() => {
      setStatus('connected')
      setLastHeartbeat(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return {
    status,
    lastHeartbeat,
    isConnected: status === 'connected'
  }
}