'use client'

import * as React from 'react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
// import { useRealtimeChannel } from '@/components/providers/RealtimeProvider' // Disabled for demo

// Mock useRealtimeChannel for demo
const useRealtimeChannel = (channel: string, callbacks: any, options?: any) => {
  return { isSubscribed: false }
}
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

// Fetch current metrics from API
async function fetchCurrentMetrics(): Promise<LiveMetrics> {
  // Mock data for development - return realistic demo data
  const peopleInStore = Math.floor(Math.random() * 50) + 20
  const totalToday = Math.floor(Math.random() * 200) + 100
  const conversionRate = Math.round((peopleInStore / totalToday) * 100)
  const averageTime = 15 + Math.floor(Math.random() * 30)
  
  const peakHour = {
    hour: 14 + Math.floor(Math.random() * 4), // Between 14-17h
    count: Math.floor(Math.random() * 30) + 20
  }

  return {
    peopleInStore,
    conversionRate,
    averageTime,
    activeEmployees: 8,
    totalToday,
    peakHour,
    trends: {
      peopleInStore: Math.random() > 0.5 ? 'up' : 'down',
      conversionRate: Math.random() > 0.5 ? 'up' : 'down',
      averageTime: Math.random() > 0.5 ? 'up' : 'down'
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
        // Simulate people count changes based on event
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

  // Simulate real-time events for development (will be replaced by actual real-time data)
  React.useEffect(() => {
    if (enableRealtime && enabled) {
      const interval = setInterval(() => {
        if (Math.random() > 0.8) { // 20% chance of event
          handleCameraEvent({
            id: `event_${Date.now()}`,
            camera_id: 'cam_1',
            person_type: Math.random() > 0.5 ? 'customer' : 'employee',
            confidence: 0.85 + Math.random() * 0.15,
            timestamp: new Date().toISOString(),
            bbox: { x: 100, y: 100, width: 50, height: 50 }
          })
        }
      }, 20000)

      return () => clearInterval(interval)
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

// Hook for flow chart real-time data
export function useRealTimeFlowData(timeRange: '24h' | '7d' | '30d' = '24h') {
  const [flowData, setFlowData] = useState<Array<{
    timestamp: string
    hour: string
    customers: number
    employees: number
    total: number
  }>>([])

  // Generate initial flow data
  useEffect(() => {
    const generateFlowData = () => {
      const hours = []
      const now = new Date()
      const hoursToGenerate = timeRange === '24h' ? 24 : timeRange === '7d' ? 24 * 7 : 24 * 30
      
      for (let i = hoursToGenerate - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000)
        const hour = time.getHours()
        
        // Simulate realistic patterns
        const baseCustomers = hour >= 9 && hour <= 21 ? 
          Math.round(15 + Math.sin((hour - 9) / 12 * Math.PI) * 10) : 
          Math.round(2 + Math.random() * 3)
        
        const baseEmployees = hour >= 8 && hour <= 22 ? 
          Math.round(3 + Math.random() * 2) : 
          Math.round(1 + Math.random())
        
        const customers = Math.max(0, baseCustomers + Math.round((Math.random() - 0.5) * 8))
        const employees = Math.max(1, baseEmployees + Math.round((Math.random() - 0.5) * 2))
        
        hours.push({
          timestamp: time.toISOString(),
          hour: time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          customers,
          employees,
          total: customers + employees
        })
      }
      
      return hours
    }

    setFlowData(generateFlowData())
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
    // Simulate connection status
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