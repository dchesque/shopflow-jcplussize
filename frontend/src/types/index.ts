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
  location: string
  rtsp_url: string
  status: 'online' | 'offline'
  fps: number
  created_at: string
  detections?: Detection[]
  peopleCount: number
  customersCount: number
  employeesCount: number
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