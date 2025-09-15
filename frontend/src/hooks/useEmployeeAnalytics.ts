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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

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

// Real data integration - All data now comes from the backend API

// API Functions (REAL DATA from backend)
async function fetchAttendanceData(employeeId: string, month: Date): Promise<AttendanceRecord[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}/attendance?month=${format(month, 'yyyy-MM')}`)

    if (!response.ok) {
      throw new Error('Failed to fetch attendance data')
    }

    const data = await response.json()
    return data.attendance_records || []

  } catch (error) {
    console.error('Error fetching real attendance data:', error)

    // Fallback: retornar dados vazios se API falhar
    return []
  }
}

async function fetchHoursData(employeeId: string, period: 'week' | 'month', startDate: Date, endDate: Date): Promise<HoursData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}/hours?period=${period}&start=${format(startDate, 'yyyy-MM-dd')}&end=${format(endDate, 'yyyy-MM-dd')}`)

    if (!response.ok) {
      throw new Error('Failed to fetch hours data')
    }

    const data = await response.json()
    return data.hours_data || []

  } catch (error) {
    console.error('Error fetching real hours data:', error)

    // Fallback: retornar dados vazios se API falhar
    return []
  }
}

async function fetchPresenceData(employeeId: string, dateRange: { start: Date; end: Date }): Promise<PresencePoint[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}/presence?start=${format(dateRange.start, 'yyyy-MM-dd')}&end=${format(dateRange.end, 'yyyy-MM-dd')}`)

    if (!response.ok) {
      throw new Error('Failed to fetch presence data')
    }

    const data = await response.json()
    return data.presence_points || []

  } catch (error) {
    console.error('Error fetching real presence data:', error)

    // Fallback: retornar dados vazios se API falhar
    return []
  }
}

async function fetchZones(): Promise<Zone[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/zones`)

    if (!response.ok) {
      throw new Error('Failed to fetch zones')
    }

    const data = await response.json()
    return data.zones || []

  } catch (error) {
    console.error('Error fetching real zones data:', error)

    // Fallback: retornar array vazio se API falhar
    return []
  }
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