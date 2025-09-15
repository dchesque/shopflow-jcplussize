'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Camera, Detection } from '@/types'

// Backend API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

interface CameraProcessResponse {
  success: boolean
  timestamp: string
  camera_id: string
  people_count: number
  customers_count: number
  employees_detected: number
  groups_detected: number
  smart_analytics: {
    face_recognition_attempts: number
    behavior_analysis_active: boolean
    temporal_analysis_results: number[]
    group_types: string[]
  }
  processing_time_ms: number
  frame_resolution: string
  detections?: Detection[]
}

// Hook para gerenciar câmeras
export function useCameras() {
  const queryClient = useQueryClient()

  // Query para buscar lista de câmeras
  const { data: cameras = [], isLoading, error, refetch } = useQuery({
    queryKey: ['cameras'],
    queryFn: async (): Promise<Camera[]> => {
      const response = await fetch(`${API_BASE_URL}/api/camera/`)
      if (!response.ok) throw new Error('Falha ao buscar câmeras')
      
      const data = await response.json()
      const camerasData = data.cameras || []
      
      // Transform backend data to frontend format
      return camerasData.map((camera: any) => ({
        id: camera.id,
        name: camera.name || 'Câmera sem nome',
        location: camera.location || 'Local não especificado',
        rtsp_url: camera.rtsp_url || '',
        ip_address: extractIpFromRtsp(camera.rtsp_url),
        port: extractPortFromRtsp(camera.rtsp_url) || 554,
        status: camera.status || 'offline',
        fps: camera.fps || 30,
        resolution: camera.resolution || '1920x1080',
        confidence_threshold: camera.confidence_threshold || 0.5,
        line_position: camera.line_position || 50,
        detection_zone: camera.detection_zone || { x: 0, y: 0, width: 100, height: 100 },
        is_active: camera.is_active !== false,
        created_at: camera.created_at || new Date().toISOString(),
        updated_at: camera.updated_at || new Date().toISOString(),
        last_seen: camera.last_seen,
        // Real-time data from backend (when available)
        peopleCount: camera.current_people_count || 0,
        customersCount: camera.current_customers_count || 0,
        employeesCount: camera.current_employees_count || 0,
        detections: camera.current_detections || []
      }))
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 5 * 1000, // Atualizar a cada 5 segundos
  })

  // Mutation para processar frame
  const processFrameMutation = useMutation({
    mutationFn: async ({ cameraId, imageData }: { cameraId: string, imageData: string | Blob }): Promise<CameraProcessResponse> => {
      const formData = new FormData()
      
      if (typeof imageData === 'string') {
        // Convert base64 to blob
        const response = await fetch(imageData)
        const blob = await response.blob()
        formData.append('frame', blob, 'frame.jpg')
      } else {
        formData.append('frame', imageData, 'frame.jpg')
      }
      
      formData.append('timestamp', new Date().toISOString())
      formData.append('camera_id', cameraId)

      const response = await fetch(`${API_BASE_URL}/camera/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BRIDGE_API_KEY || 'development-key'}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Falha ao processar frame')
      }

      return await response.json()
    },
    onSuccess: (data) => {
      // Atualizar cache da câmera com novos dados
      queryClient.setQueryData(['cameras'], (oldData: Camera[] | undefined) => {
        if (!oldData) return oldData
        
        return oldData.map(camera => 
          camera.id === data.camera_id 
            ? {
                ...camera,
                peopleCount: data.people_count,
                customersCount: data.customers_count,
                employeesCount: data.employees_detected
              }
            : camera
        )
      })
    }
  })

  // Mutation para capturar snapshot
  const captureSnapshotMutation = useMutation({
    mutationFn: async (cameraId: string): Promise<string> => {
      const response = await fetch(`${API_BASE_URL}/api/camera/${cameraId}/snapshot`)
      if (!response.ok) throw new Error('Falha ao capturar snapshot')
      
      const data = await response.json()
      return data.data // Base64 image data
    }
  })

  // Mutation para criar câmera
  const createCameraMutation = useMutation({
    mutationFn: async (cameraData: Partial<Camera>): Promise<string> => {
      const response = await fetch(`${API_BASE_URL}/api/camera/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cameraData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Falha ao criar câmera')
      }

      const data = await response.json()
      return data.camera_id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cameras'] })
    }
  })

  // Mutation para atualizar câmera
  const updateCameraMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Camera> }): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/api/camera/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Falha ao atualizar câmera')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cameras'] })
    }
  })

  // Mutation para excluir câmera
  const deleteCameraMutation = useMutation({
    mutationFn: async (cameraId: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/api/camera/${cameraId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Falha ao excluir câmera')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cameras'] })
    }
  })

  return {
    cameras,
    isLoading,
    error,
    refetch,
    processFrame: processFrameMutation.mutateAsync,
    isProcessingFrame: processFrameMutation.isPending,
    captureSnapshot: captureSnapshotMutation.mutateAsync,
    isCapturingSnapshot: captureSnapshotMutation.isPending,
    createCamera: createCameraMutation,
    updateCamera: updateCameraMutation,
    deleteCamera: deleteCameraMutation
  }
}

// Funções auxiliares para extrair IP e porta da URL RTSP
function extractIpFromRtsp(rtspUrl: string): string {
  if (!rtspUrl) return ''
  
  try {
    const url = new URL(rtspUrl)
    return url.hostname
  } catch {
    // Fallback para URLs malformadas
    const match = rtspUrl.match(/rtsp:\/\/([^:\/]+)/)
    return match ? match[1] : ''
  }
}

function extractPortFromRtsp(rtspUrl: string): number | null {
  if (!rtspUrl) return null
  
  try {
    const url = new URL(rtspUrl)
    return url.port ? parseInt(url.port) : null
  } catch {
    // Fallback para URLs malformadas
    const match = rtspUrl.match(/rtsp:\/\/[^:]+:(\d+)/)
    return match ? parseInt(match[1]) : null
  }
}

// Hook para métricas de câmeras em tempo real (integração real)
export function useCameraMetrics(cameraId?: string) {
  const { data: liveMetrics, isLoading } = useQuery({
    queryKey: ['camera-metrics', cameraId],
    queryFn: async () => {
      if (!cameraId) return null
      
      const response = await fetch(`${API_BASE_URL}/api/camera/${cameraId}/events?limit=1`)
      if (!response.ok) throw new Error('Falha ao buscar métricas')
      
      const data = await response.json()
      const latestEvent = data.events?.[0]
      
      if (!latestEvent) return null
      
      return {
        peopleCount: latestEvent.people_count || 0,
        customersCount: latestEvent.customers_count || 0,
        employeesCount: latestEvent.employees_count || 0,
        processingTime: latestEvent.processing_time_ms || 0,
        timestamp: latestEvent.timestamp
      }
    },
    enabled: !!cameraId,
    refetchInterval: 2000, // Atualizar a cada 2 segundos
    staleTime: 1000
  })

  return { liveMetrics, isLoading }
}

// Hook para status de conexão das câmeras
export function useCameraHealth() {
  const { data, isLoading } = useQuery({
    queryKey: ['camera-health'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/health`)
      if (!response.ok) throw new Error('Health check failed')
      
      const healthData = await response.json()
      return {
        detector_loaded: healthData.services?.detector || false,
        analytics_initialized: healthData.services?.ai_engine || false,
        modules: {
          face_recognition: healthData.services?.ai_engine || false,
          behavior_analysis: healthData.services?.ai_engine || false,
          group_detection: healthData.services?.ai_engine || false,
          temporal_analysis: healthData.services?.ai_engine || false
        }
      }
    },
    staleTime: 60 * 1000, // 1 minuto
    refetchInterval: 30 * 1000 // Verificar a cada 30 segundos
  })

  return {
    health: data,
    isHealthy: data?.detector_loaded && data?.analytics_initialized,
    isLoading
  }
}

// Hook para teste de conexão de câmeras
export function useCameraConnection() {
  const testConnectionMutation = useMutation({
    mutationFn: async (cameraId: string): Promise<{ success: boolean; message: string; latency?: number }> => {
      try {
        const startTime = Date.now()
        const response = await fetch(`${API_BASE_URL}/api/camera/${cameraId}/test-connection`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        const latency = Date.now() - startTime

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        return {
          success: data.success || true,
          message: data.message || 'Conexão estabelecida com sucesso',
          latency
        }
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro desconhecido na conexão'
        }
      }
    }
  })

  return {
    testConnection: testConnectionMutation,
    isTestingConnection: testConnectionMutation.isPending
  }
}

// Hook para analytics individuais por câmera
export function useCameraAnalytics(cameraId: string) {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['camera-analytics', cameraId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/camera/${cameraId}/events?limit=100`)
      if (!response.ok) {
        throw new Error('Falha ao buscar analytics da câmera')
      }

      const data = await response.json()
      const events = data.events || []
      
      // Processar eventos para gerar analytics
      const totalPeople = events.reduce((sum: number, event: any) => sum + (event.people_count || 0), 0)
      const totalCustomers = events.reduce((sum: number, event: any) => sum + (event.customers_count || 0), 0)
      const totalEmployees = events.reduce((sum: number, event: any) => sum + (event.employees_count || 0), 0)
      const avgProcessingTime = events.length > 0 
        ? events.reduce((sum: number, event: any) => sum + (event.processing_time_ms || 0), 0) / events.length 
        : 0

      return {
        camera_id: cameraId,
        daily_metrics: {
          people_count: totalPeople,
          customers_count: totalCustomers,
          employees_count: totalEmployees,
          avg_processing_time: Math.round(avgProcessingTime),
          events_count: events.length,
          last_updated: new Date().toISOString()
        },
        recent_events: events.slice(0, 10)
      }
    },
    enabled: !!cameraId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 2 * 60 * 1000 // Atualizar a cada 2 minutos
  })

  return {
    analytics,
    isLoading,
    error
  }
}

// Hook para export de dados
export function useCameraExport() {
  const exportSnapshotMutation = useMutation({
    mutationFn: async (cameraId: string): Promise<string> => {
      const response = await fetch(`${API_BASE_URL}/api/camera/${cameraId}/snapshot`)
      if (!response.ok) {
        throw new Error('Falha ao exportar snapshot')
      }

      const data = await response.json()
      
      // Converter base64 para blob e criar URL
      const base64Data = data.data.split(',')[1] // Remove 'data:image/jpeg;base64,'
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/jpeg' })
      
      return URL.createObjectURL(blob)
    }
  })

  const exportReportMutation = useMutation({
    mutationFn: async ({ cameraId, format = 'csv', dateRange }: { 
      cameraId: string; 
      format?: 'csv' | 'json'; 
      dateRange: { start: string; end: string } 
    }): Promise<string> => {
      const response = await fetch(`${API_BASE_URL}/api/camera/${cameraId}/events?start_date=${dateRange.start}&end_date=${dateRange.end}&limit=1000`)
      if (!response.ok) {
        throw new Error('Falha ao exportar relatório')
      }

      const data = await response.json()
      const events = data.events || []
      
      let content: string
      let mimeType: string
      let filename: string
      
      if (format === 'csv') {
        // Gerar CSV
        const headers = ['timestamp', 'people_count', 'customers_count', 'employees_count', 'processing_time_ms']
        const csvContent = [
          headers.join(','),
          ...events.map((event: any) => headers.map(header => event[header] || 0).join(','))
        ].join('\n')
        
        content = csvContent
        mimeType = 'text/csv'
        filename = `camera_${cameraId}_report.csv`
      } else {
        // Gerar JSON
        content = JSON.stringify(events, null, 2)
        mimeType = 'application/json'
        filename = `camera_${cameraId}_report.json`
      }
      
      const blob = new Blob([content], { type: mimeType })
      return URL.createObjectURL(blob)
    }
  })

  return {
    exportSnapshot: exportSnapshotMutation,
    exportReport: exportReportMutation
  }
}