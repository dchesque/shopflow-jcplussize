/**
 * API Service para gerenciamento de câmeras
 */

export interface Camera {
  id: string
  name: string
  rtsp_url: string
  location: string
  line_position: number
  is_active: boolean
  fps: number
  resolution: string
  detection_zone: {
    x: number
    y: number
    width: number
    height: number
  }
  confidence_threshold: number
  status: 'online' | 'offline' | 'error'
  last_seen?: string
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
}

export interface CameraCreateData {
  name: string
  rtsp_url: string
  location?: string
  line_position?: number
  is_active?: boolean
  fps?: number
  resolution?: string
  detection_zone?: {
    x: number
    y: number
    width: number
    height: number
  }
  confidence_threshold?: number
}

export interface CameraUpdateData extends Partial<CameraCreateData> {}

export interface CameraEvent {
  id: string
  camera_id: string
  timestamp: string
  people_count: number
  customers_count: number
  employees_count: number
  processing_time_ms: number
  metadata?: Record<string, any>
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

class CameraAPI {
  private baseUrl = `${API_BASE}/api/camera`

  async listCameras(): Promise<{ cameras: Camera[]; total: number }> {
    const response = await fetch(`${this.baseUrl}/`)
    if (!response.ok) {
      throw new Error(`Erro ao listar câmeras: ${response.statusText}`)
    }
    return response.json()
  }

  async getCamera(cameraId: string): Promise<{ camera: Camera }> {
    const response = await fetch(`${this.baseUrl}/${cameraId}`)
    if (!response.ok) {
      throw new Error(`Erro ao obter câmera: ${response.statusText}`)
    }
    return response.json()
  }

  async createCamera(data: CameraCreateData): Promise<{ camera_id: string; message: string }> {
    const response = await fetch(`${this.baseUrl}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error(`Erro ao criar câmera: ${response.statusText}`)
    }
    return response.json()
  }

  async updateCamera(cameraId: string, data: CameraUpdateData): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/${cameraId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error(`Erro ao atualizar câmera: ${response.statusText}`)
    }
    return response.json()
  }

  async deleteCamera(cameraId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/${cameraId}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error(`Erro ao remover câmera: ${response.statusText}`)
    }
    return response.json()
  }

  async testConnection(cameraId: string): Promise<{ success: boolean; status: string; message: string }> {
    const response = await fetch(`${this.baseUrl}/${cameraId}/test-connection`, {
      method: 'POST',
    })
    
    if (!response.ok) {
      throw new Error(`Erro ao testar conexão: ${response.statusText}`)
    }
    return response.json()
  }

  async getCameraEvents(
    cameraId: string,
    options?: {
      startDate?: string
      endDate?: string
      limit?: number
    }
  ): Promise<{ events: CameraEvent[]; total: number }> {
    const params = new URLSearchParams()
    if (options?.startDate) params.append('start_date', options.startDate)
    if (options?.endDate) params.append('end_date', options.endDate)
    if (options?.limit) params.append('limit', options.limit.toString())

    const response = await fetch(`${this.baseUrl}/${cameraId}/events?${params}`)
    if (!response.ok) {
      throw new Error(`Erro ao obter eventos da câmera: ${response.statusText}`)
    }
    return response.json()
  }

  async getStatus(): Promise<{
    detector_loaded: boolean
    analytics_initialized: boolean
    modules: {
      face_recognition: boolean
      behavior_analysis: boolean
      group_detection: boolean
      temporal_analysis: boolean
    }
  }> {
    const response = await fetch(`${this.baseUrl}/status`)
    if (!response.ok) {
      throw new Error(`Erro ao obter status: ${response.statusText}`)
    }
    return response.json()
  }
}

export const cameraAPI = new CameraAPI()