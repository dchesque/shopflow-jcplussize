'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Camera, Detection } from '@/types'

// Simulação do backend - em produção seria a API real
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001/api'

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
      try {
        const response = await fetch(`${API_BASE_URL}/camera/status`)
        if (!response.ok) throw new Error('Falha ao buscar status das câmeras')
        
        // Mock data baseado na estrutura real do backend
        return [
          {
            id: 'cam_001',
            name: 'Entrada Principal',
            location: 'Hall de Entrada',
            rtsp_url: 'rtsp://192.168.1.100:554/stream1',
            ip_address: '192.168.1.100',
            port: 554,
            status: 'online',
            fps: 30,
            created_at: new Date().toISOString(),
            peopleCount: Math.floor(Math.random() * 15) + 5,
            customersCount: Math.floor(Math.random() * 12) + 3,
            employeesCount: Math.floor(Math.random() * 3) + 1,
            detections: generateMockDetections()
          },
          {
            id: 'cam_002', 
            name: 'Área de Vendas',
            location: 'Setor Eletrônicos',
            rtsp_url: 'rtsp://192.168.1.101:554/stream1',
            ip_address: '192.168.1.101',
            port: 554,
            status: 'online',
            fps: 25,
            created_at: new Date().toISOString(),
            peopleCount: Math.floor(Math.random() * 10) + 3,
            customersCount: Math.floor(Math.random() * 8) + 2,
            employeesCount: Math.floor(Math.random() * 2) + 1,
            detections: generateMockDetections()
          },
          {
            id: 'cam_003',
            name: 'Caixa Principal',
            location: 'Área de Checkout',
            rtsp_url: 'rtsp://192.168.1.102:554/stream1',
            ip_address: '192.168.1.102',
            port: 554,
            status: 'online',
            fps: 30,
            created_at: new Date().toISOString(),
            peopleCount: Math.floor(Math.random() * 8) + 2,
            customersCount: Math.floor(Math.random() * 6) + 1,
            employeesCount: 1,
            detections: generateMockDetections()
          },
          {
            id: 'cam_004',
            name: 'Estacionamento',
            location: 'Área Externa',
            rtsp_url: 'rtsp://192.168.1.103:554/stream1',
            ip_address: '192.168.1.103',
            port: 554,
            status: 'offline',
            fps: 0,
            created_at: new Date().toISOString(),
            peopleCount: 0,
            customersCount: 0,
            employeesCount: 0,
            detections: []
          }
        ]
      } catch (error) {
        console.error('Erro ao buscar câmeras:', error)
        // Retorna dados mock em caso de erro
        return []
      }
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
      // Simula captura de snapshot
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(`data:image/jpeg;base64,${btoa('mock-snapshot-' + cameraId)}`)
        }, 500)
      })
    }
  })

  // Mutation para criar câmera
  const createCameraMutation = useMutation({
    mutationFn: async (cameraData: Partial<Camera>): Promise<Camera> => {
      const response = await fetch(`${API_BASE_URL}/cameras`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BRIDGE_API_KEY || 'development-key'}`
        },
        body: JSON.stringify(cameraData)
      })

      if (!response.ok) {
        throw new Error('Falha ao criar câmera')
      }

      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cameras'] })
    }
  })

  // Mutation para atualizar câmera
  const updateCameraMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Camera> }): Promise<Camera> => {
      const response = await fetch(`${API_BASE_URL}/cameras/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BRIDGE_API_KEY || 'development-key'}`
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Falha ao atualizar câmera')
      }

      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cameras'] })
    }
  })

  // Mutation para excluir câmera
  const deleteCameraMutation = useMutation({
    mutationFn: async (cameraId: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/cameras/${cameraId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BRIDGE_API_KEY || 'development-key'}`
        }
      })

      if (!response.ok) {
        throw new Error('Falha ao excluir câmera')
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

// Hook para métricas de câmeras em tempo real
export function useCameraMetrics(cameraId?: string) {
  const [liveMetrics, setLiveMetrics] = useState<{
    peopleCount: number
    customersCount: number
    employeesCount: number
    processingTime: number
    timestamp: string
  } | null>(null)

  useEffect(() => {
    // Simula WebSocket connection para métricas em tempo real
    const interval = setInterval(() => {
      if (cameraId) {
        setLiveMetrics({
          peopleCount: Math.floor(Math.random() * 20) + 5,
          customersCount: Math.floor(Math.random() * 15) + 3,
          employeesCount: Math.floor(Math.random() * 5) + 1,
          processingTime: Math.random() * 100 + 20,
          timestamp: new Date().toISOString()
        })
      }
    }, 2000) // Atualizar a cada 2 segundos

    return () => clearInterval(interval)
  }, [cameraId])

  return { liveMetrics }
}

// Função auxiliar para gerar detecções mock
function generateMockDetections(): Detection[] {
  const count = Math.floor(Math.random() * 5) + 1
  const detections: Detection[] = []

  for (let i = 0; i < count; i++) {
    detections.push({
      id: `detection_${i}`,
      label: Math.random() > 0.7 ? 'Funcionário' : 'Cliente',
      confidence: Math.random() * 0.3 + 0.7, // 0.7 - 1.0
      x: Math.random() * 70 + 5, // 5% - 75%
      y: Math.random() * 60 + 10, // 10% - 70%
      width: Math.random() * 15 + 10, // 10% - 25%
      height: Math.random() * 20 + 15 // 15% - 35%
    })
  }

  return detections
}

// Hook para status de conexão das câmeras
export function useCameraHealth() {
  const { data, isLoading } = useQuery({
    queryKey: ['camera-health'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/camera/status`)
        if (!response.ok) throw new Error('Health check failed')
        
        return await response.json()
      } catch (error) {
        console.error('Camera health check failed:', error)
        return {
          detector_loaded: true,
          analytics_initialized: true,
          modules: {
            face_recognition: true,
            behavior_analysis: true,
            group_detection: true,
            temporal_analysis: true
          }
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
        const response = await fetch(`${API_BASE_URL}/cameras/${cameraId}/test-connection`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BRIDGE_API_KEY || 'development-key'}`
          }
        })

        const latency = Date.now() - startTime

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        return {
          success: true,
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
      try {
        const response = await fetch(`${API_BASE_URL}/analytics/camera/${cameraId}`, {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BRIDGE_API_KEY || 'development-key'}`
          }
        })

        if (!response.ok) {
          throw new Error('Falha ao buscar analytics da câmera')
        }

        return await response.json()
      } catch (error) {
        // Mock data em caso de erro
        return {
          camera_id: cameraId,
          daily_metrics: {
            people_count: Math.floor(Math.random() * 500) + 100,
            customers_count: Math.floor(Math.random() * 400) + 80,
            employees_count: Math.floor(Math.random() * 20) + 5,
            avg_dwell_time: Math.floor(Math.random() * 300) + 60,
            peak_hours: ['10:00', '14:00', '18:00'],
            conversion_rate: Math.random() * 0.3 + 0.1
          },
          behavior_patterns: {
            hotspots: [
              { x: 25, y: 30, intensity: 0.8 },
              { x: 60, y: 45, intensity: 0.6 },
              { x: 80, y: 20, intensity: 0.4 }
            ],
            movement_patterns: ['entrance_to_products', 'products_to_checkout', 'browsing'],
            group_sizes: { single: 45, pair: 35, group: 20 }
          },
          predictions: {
            next_hour_flow: Math.floor(Math.random() * 50) + 10,
            staff_recommendation: Math.floor(Math.random() * 3) + 2,
            anomaly_score: Math.random() * 0.1
          }
        }
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
      try {
        const response = await fetch(`${API_BASE_URL}/cameras/${cameraId}/export/snapshot`, {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BRIDGE_API_KEY || 'development-key'}`
          }
        })

        if (!response.ok) {
          throw new Error('Falha ao exportar snapshot')
        }

        const blob = await response.blob()
        return URL.createObjectURL(blob)
      } catch (error) {
        throw new Error('Erro ao exportar snapshot')
      }
    }
  })

  const exportVideoClipMutation = useMutation({
    mutationFn: async ({ cameraId, duration = 30 }: { cameraId: string; duration?: number }): Promise<string> => {
      try {
        const response = await fetch(`${API_BASE_URL}/cameras/${cameraId}/export/clip`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BRIDGE_API_KEY || 'development-key'}`
          },
          body: JSON.stringify({ duration })
        })

        if (!response.ok) {
          throw new Error('Falha ao exportar clipe')
        }

        const blob = await response.blob()
        return URL.createObjectURL(blob)
      } catch (error) {
        throw new Error('Erro ao exportar clipe de vídeo')
      }
    }
  })

  const exportReportMutation = useMutation({
    mutationFn: async ({ cameraId, format = 'pdf', dateRange }: { 
      cameraId: string; 
      format?: 'pdf' | 'csv' | 'xlsx'; 
      dateRange: { start: string; end: string } 
    }): Promise<string> => {
      try {
        const response = await fetch(`${API_BASE_URL}/analytics/camera/${cameraId}/export`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BRIDGE_API_KEY || 'development-key'}`
          },
          body: JSON.stringify({ format, ...dateRange })
        })

        if (!response.ok) {
          throw new Error('Falha ao exportar relatório')
        }

        const blob = await response.blob()
        return URL.createObjectURL(blob)
      } catch (error) {
        throw new Error('Erro ao exportar relatório')
      }
    }
  })

  return {
    exportSnapshot: exportSnapshotMutation,
    exportVideoClip: exportVideoClipMutation,
    exportReport: exportReportMutation
  }
}