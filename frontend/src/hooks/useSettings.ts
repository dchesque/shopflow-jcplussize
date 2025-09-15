import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

// Types
export interface PrivacySetting {
  id: string
  key: string
  value: boolean | string | number
  category: 'recognition' | 'data' | 'compliance' | 'audit'
  required?: boolean
  description?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'manager' | 'operator' | 'viewer'
  status: 'active' | 'inactive' | 'pending'
  lastSeen: Date
  permissions: string[]
  createdAt: Date
}

export interface StoreInfo {
  id: string
  name: string
  address: string
  phone: string
  email: string
  cnpj: string
  maxCapacity: number
  operatingHours: Record<string, {
    open: string
    close: string
    enabled: boolean
  }>
  zones: Zone[]
}

export interface Zone {
  id: string
  name: string
  description: string
  color: string
  coordinates?: {
    x: number
    y: number
    width: number
    height: number
  }
}

// Privacy Settings Hooks
export function usePrivacySettings() {
  return useQuery({
    queryKey: ['privacy-settings'],
    queryFn: async (): Promise<PrivacySetting[]> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/settings/privacy`)
        if (!response.ok) throw new Error('Failed to fetch privacy settings')
        const data = await response.json()
        return data.settings || []
      } catch (error) {
        console.error('Error fetching privacy settings:', error)
        return []
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdatePrivacySettings() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (settings: PrivacySetting[]) => {
      // Integração com backend
      const response = await fetch('/api/settings/privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      if (!response.ok) {
        throw new Error('Falha ao atualizar configurações de privacidade')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-settings'] })
    }
  })
}

// User Management Hooks
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users`)
        if (!response.ok) throw new Error('Failed to fetch users')
        const data = await response.json()
        return data.users || []
      } catch (error) {
        console.error('Error fetching users:', error)
        return []
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      
      if (!response.ok) {
        throw new Error('Falha ao criar usuário')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...userData }: Partial<User> & { id: string }) => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      
      if (!response.ok) {
        throw new Error('Falha ao atualizar usuário')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Falha ao excluir usuário')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

// Store Settings Hooks
export function useStoreInfo() {
  return useQuery({
    queryKey: ['store-info'],
    queryFn: async (): Promise<StoreInfo> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/settings/store`)
        if (!response.ok) throw new Error('Failed to fetch store info')
        const data = await response.json()
        return data.store || {}
      } catch (error) {
        console.error('Error fetching store info:', error)
        // Return minimal store object if API fails
        return {
          id: '',
          name: '',
          address: '',
          phone: '',
          email: '',
          cnpj: '',
          maxCapacity: 0,
          operatingHours: {},
          zones: []
        }
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useUpdateStoreInfo() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (storeData: Partial<StoreInfo>) => {
      const response = await fetch('/api/settings/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeData)
      })
      
      if (!response.ok) {
        throw new Error('Falha ao atualizar informações da loja')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-info'] })
    }
  })
}

// System Status Hook
export function useSystemStatus() {
  return useQuery({
    queryKey: ['system-status'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/settings/system-status`)
        if (!response.ok) throw new Error('Failed to fetch system status')
        const data = await response.json()
        return data.status || {
          uptime: '0%',
          dataUsage: '0GB',
          activeUsers: 0,
          lastBackup: null,
          systemHealth: 'unknown',
          components: {
            database: false,
            ai_engine: false,
            cameras: false,
            analytics: false
          }
        }
      } catch (error) {
        console.error('Error fetching system status:', error)
        return {
          uptime: '0%',
          dataUsage: '0GB',
          activeUsers: 0,
          lastBackup: null,
          systemHealth: 'error',
          components: {
            database: false,
            ai_engine: false,
            cameras: false,
            analytics: false
          }
        }
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

// Compliance Report Hook
export function useComplianceReport() {
  return useQuery({
    queryKey: ['compliance-report'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/settings/compliance`)
        if (!response.ok) throw new Error('Failed to fetch compliance report')
        const data = await response.json()
        return data.compliance || {
          lgpdCompliant: false,
          gdprCompliant: false,
          dataRetentionPeriod: 0,
          encryptedDataPercentage: 0,
          auditLogsEnabled: false,
          lastAudit: null,
          rightsRequests: {
            access: 0,
            correction: 0,
            deletion: 0
          }
        }
      } catch (error) {
        console.error('Error fetching compliance report:', error)
        return {
          lgpdCompliant: false,
          gdprCompliant: false,
          dataRetentionPeriod: 0,
          encryptedDataPercentage: 0,
          auditLogsEnabled: false,
          lastAudit: null,
          rightsRequests: {
            access: 0,
            correction: 0,
            deletion: 0
          }
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Export Data Hook
export function useExportData() {
  return useMutation({
    mutationFn: async (exportType: 'privacy' | 'audit' | 'users' | 'analytics') => {
      const response = await fetch(`/api/export/${exportType}`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Falha ao exportar dados')
      }
      
      // Return blob for download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `shopflow-${exportType}-export-${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      return { success: true }
    }
  })
}