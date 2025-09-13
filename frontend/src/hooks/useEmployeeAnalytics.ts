'use client'

import { useQuery } from '@tanstack/react-query'
import { addDays, format, startOfMonth, endOfMonth } from 'date-fns'

// Types for Sprint 8 Analytics
export interface AttendanceRecord {
  date: Date
  status: 'present' | 'absent' | 'late' | 'half_day' | 'vacation' | 'sick'
  checkIn?: string
  checkOut?: string
  hoursWorked?: number
  notes?: string
}

export interface HoursData {
  period: string
  date: Date
  regularHours: number
  overtimeHours: number
  expectedHours: number
  productivity?: number
  department?: string
}

export interface PresencePoint {
  employeeId: string
  employeeName?: string
  timestamp: Date
  zone: string
  duration: number
  activity: 'work' | 'break' | 'meeting' | 'idle'
  department?: string
}

export interface Zone {
  id: string
  name: string
  type: 'work' | 'break' | 'meeting' | 'common'
  color: string
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Query Keys
export const analyticsKeys = {
  all: ['employee-analytics'] as const,
  attendance: (employeeId: string, month: Date) => 
    [...analyticsKeys.all, 'attendance', employeeId, format(month, 'yyyy-MM')] as const,
  hours: (employeeId: string, period: string, startDate: Date, endDate: Date) =>
    [...analyticsKeys.all, 'hours', employeeId, period, format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')] as const,
  presence: (employeeId: string, dateRange: { start: Date; end: Date }) =>
    [...analyticsKeys.all, 'presence', employeeId, format(dateRange.start, 'yyyy-MM-dd'), format(dateRange.end, 'yyyy-MM-dd')] as const,
  zones: () => [...analyticsKeys.all, 'zones'] as const,
}

// Mock data generators
const generateMockAttendance = (employeeId: string, month: Date): AttendanceRecord[] => {
  const records: AttendanceRecord[] = []
  const startDate = startOfMonth(month)
  const endDate = endOfMonth(month)
  
  for (let date = new Date(startDate); date <= endDate; date = addDays(date, 1)) {
    const dayOfWeek = date.getDay()
    
    // Skip weekends for work days
    if (dayOfWeek === 0 || dayOfWeek === 6) continue
    
    const random = Math.random()
    let status: AttendanceRecord['status']
    let checkIn: string | undefined
    let checkOut: string | undefined
    let hoursWorked: number | undefined
    
    if (random > 0.95) {
      status = 'absent'
    } else if (random > 0.9) {
      status = 'sick'
    } else if (random > 0.85) {
      status = 'vacation'
    } else if (random > 0.8) {
      status = 'late'
      checkIn = '09:15'
      checkOut = '18:00'
      hoursWorked = 8.25
    } else if (random > 0.7) {
      status = 'half_day'
      checkIn = '09:00'
      checkOut = '13:00'
      hoursWorked = 4
    } else {
      status = 'present'
      checkIn = '09:00'
      checkOut = '18:00'
      hoursWorked = 8
    }
    
    records.push({
      date: new Date(date),
      status,
      checkIn,
      checkOut,
      hoursWorked,
      notes: status === 'sick' ? 'Atestado médico' : status === 'late' ? 'Trânsito' : undefined
    })
  }
  
  return records
}

const generateMockHoursData = (employeeId: string, period: 'week' | 'month', startDate: Date, endDate: Date): HoursData[] => {
  const data: HoursData[] = []
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
  
  if (period === 'week') {
    // Generate weekly data
    for (let i = 0; i < Math.min(daysDiff / 7, 12); i++) {
      const weekStart = addDays(startDate, i * 7)
      const regularHours = 35 + Math.random() * 10
      const overtimeHours = Math.random() > 0.7 ? Math.random() * 8 : 0
      
      data.push({
        period: `Sem ${i + 1}`,
        date: weekStart,
        regularHours: Math.round(regularHours * 10) / 10,
        overtimeHours: Math.round(overtimeHours * 10) / 10,
        expectedHours: 40,
        productivity: 80 + Math.random() * 20,
        department: 'Vendas'
      })
    }
  } else {
    // Generate monthly data
    for (let i = 0; i < Math.min(daysDiff / 30, 12); i++) {
      const monthStart = addDays(startDate, i * 30)
      const regularHours = 160 + Math.random() * 20
      const overtimeHours = Math.random() > 0.5 ? Math.random() * 20 : 0
      
      data.push({
        period: format(monthStart, 'MMM/yy'),
        date: monthStart,
        regularHours: Math.round(regularHours * 10) / 10,
        overtimeHours: Math.round(overtimeHours * 10) / 10,
        expectedHours: 160,
        productivity: 75 + Math.random() * 25,
        department: 'Vendas'
      })
    }
  }
  
  return data
}

const generateMockPresenceData = (employeeId: string, dateRange: { start: Date; end: Date }): PresencePoint[] => {
  const data: PresencePoint[] = []
  const zones = ['Entrada', 'Caixa', 'Provador', 'Estoque', 'Escritório', 'Descanso']
  const activities: PresencePoint['activity'][] = ['work', 'break', 'meeting', 'idle']
  
  // Generate 50-200 random presence points
  const count = 50 + Math.random() * 150
  
  for (let i = 0; i < count; i++) {
    const randomDate = new Date(dateRange.start.getTime() + Math.random() * (dateRange.end.getTime() - dateRange.start.getTime()))
    
    data.push({
      employeeId,
      employeeName: `Funcionário ${employeeId}`,
      timestamp: randomDate,
      zone: zones[Math.floor(Math.random() * zones.length)],
      duration: 5 + Math.random() * 120, // 5-125 minutes
      activity: activities[Math.floor(Math.random() * activities.length)],
      department: 'Vendas'
    })
  }
  
  return data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
}

const mockZones: Zone[] = [
  { id: 'entrada', name: 'Entrada', type: 'common', color: '#3b82f6' },
  { id: 'caixa', name: 'Caixa', type: 'work', color: '#10b981' },
  { id: 'provador', name: 'Provador', type: 'work', color: '#f59e0b' },
  { id: 'estoque', name: 'Estoque', type: 'work', color: '#ef4444' },
  { id: 'escritorio', name: 'Escritório', type: 'meeting', color: '#8b5cf6' },
  { id: 'descanso', name: 'Área de Descanso', type: 'break', color: '#06b6d4' }
]

// API Functions (using mock data for now)
async function fetchAttendanceData(employeeId: string, month: Date): Promise<AttendanceRecord[]> {
  // Mock API call
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // In production, this would be:
  // const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}/attendance?month=${format(month, 'yyyy-MM')}`)
  // if (!response.ok) throw new Error('Failed to fetch attendance data')
  // return response.json()
  
  return generateMockAttendance(employeeId, month)
}

async function fetchHoursData(employeeId: string, period: 'week' | 'month', startDate: Date, endDate: Date): Promise<HoursData[]> {
  // Mock API call
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // In production:
  // const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}/hours?period=${period}&start=${format(startDate, 'yyyy-MM-dd')}&end=${format(endDate, 'yyyy-MM-dd')}`)
  // if (!response.ok) throw new Error('Failed to fetch hours data')
  // return response.json()
  
  return generateMockHoursData(employeeId, period, startDate, endDate)
}

async function fetchPresenceData(employeeId: string, dateRange: { start: Date; end: Date }): Promise<PresencePoint[]> {
  // Mock API call
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // In production:
  // const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}/presence?start=${format(dateRange.start, 'yyyy-MM-dd')}&end=${format(dateRange.end, 'yyyy-MM-dd')}`)
  // if (!response.ok) throw new Error('Failed to fetch presence data')
  // return response.json()
  
  return generateMockPresenceData(employeeId, dateRange)
}

async function fetchZones(): Promise<Zone[]> {
  // Mock API call
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // In production:
  // const response = await fetch(`${API_BASE_URL}/api/zones`)
  // if (!response.ok) throw new Error('Failed to fetch zones')
  // return response.json()
  
  return mockZones
}

// Hooks
export function useAttendanceData(employeeId: string, month: Date) {
  const query = useQuery({
    queryKey: analyticsKeys.attendance(employeeId, month),
    queryFn: () => fetchAttendanceData(employeeId, month),
    enabled: !!employeeId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  return {
    attendanceData: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useHoursData(employeeId: string, period: 'week' | 'month', startDate: Date, endDate: Date) {
  const query = useQuery({
    queryKey: analyticsKeys.hours(employeeId, period, startDate, endDate),
    queryFn: () => fetchHoursData(employeeId, period, startDate, endDate),
    enabled: !!employeeId && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 15, // 15 minutes
  })

  return {
    hoursData: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

export function usePresenceData(employeeId: string, dateRange: { start: Date; end: Date }) {
  const query = useQuery({
    queryKey: analyticsKeys.presence(employeeId, dateRange),
    queryFn: () => fetchPresenceData(employeeId, dateRange),
    enabled: !!employeeId && !!dateRange.start && !!dateRange.end,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    presenceData: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useZones() {
  const query = useQuery({
    queryKey: analyticsKeys.zones(),
    queryFn: fetchZones,
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  return {
    zones: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}