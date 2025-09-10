import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Types for our database
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
}