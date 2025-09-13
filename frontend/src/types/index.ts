// Database types
export interface CameraEvent {
  id: string
  camera_id: string
  person_type: 'customer' | 'employee'
  confidence: number
  timestamp: string
  bbox: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface Employee {
  id: string
  name: string
  email: string
  department: string
  photo_url?: string
  status: 'active' | 'inactive'
  created_at: string
}

export interface Camera {
  id: string
  name: string
  rtsp_url: string
  location: string
  status: 'online' | 'offline' | 'error'
  fps: number
  resolution: string
  confidence_threshold: number
  line_position: number
  detection_zone: {
    x: number
    y: number
    width: number
    height: number
  }
  is_active: boolean
  created_at: string
  updated_at: string
  last_seen?: string
  ip_address?: string
  port?: number
  peopleCount?: number
  customersCount?: number
  employeesCount?: number
  detections?: Detection[]
}

export interface Detection {
  id: string
  label: string
  confidence: number
  x: number
  y: number
  width: number
  height: number
}

// UI types
export interface MenuItem {
  id: string
  label: string
  href: string
  icon: any
  badge?: string | number
}

export interface Metric {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  color: 'red' | 'purple' | 'blue' | 'green' | 'orange'
}

// Store types
export interface UIStore {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  theme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light') => void
}

export interface AuthStore {
  user: any | null
  isAuthenticated: boolean
  setUser: (user: any) => void
  logout: () => void
}

// Camera-specific types
export interface CameraFormData {
  name: string
  rtsp_url: string
  location: string
  fps: number
  resolution: string
  confidence_threshold: number
  line_position: number
  detection_zone: {
    x: number
    y: number
    width: number
    height: number
  }
  is_active: boolean
}

export interface CameraHealth {
  detector_loaded: boolean
  analytics_initialized: boolean
  modules: {
    face_recognition: boolean
    behavior_analysis: boolean
    group_detection: boolean
    temporal_analysis: boolean
  }
}

export interface CameraConnectionTest {
  success: boolean
  status: 'online' | 'offline'
  message: string
  camera_id: string
  latency?: number
}