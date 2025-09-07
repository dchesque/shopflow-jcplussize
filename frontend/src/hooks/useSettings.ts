import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

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
      // Mock data - integrar com backend
      return [
        {
          id: '1',
          key: 'face_recognition',
          value: true,
          category: 'recognition',
          description: 'Ativar detecção e reconhecimento de funcionários'
        },
        {
          id: '2',
          key: 'data_retention_days',
          value: 90,
          category: 'data',
          required: true,
          description: 'Período de retenção de dados em dias'
        }
      ]
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
      // Mock data - integrar com backend
      return [
        {
          id: '1',
          name: 'João Silva',
          email: 'joao@shopflow.com',
          role: 'owner',
          status: 'active',
          lastSeen: new Date(Date.now() - 1000 * 60 * 15),
          permissions: ['all'],
          createdAt: new Date('2024-01-15')
        }
      ]
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
      // Mock data - integrar com backend
      return {
        id: '1',
        name: 'Loja ShopFlow Centro',
        address: 'Rua das Flores, 123 - Centro, São Paulo - SP',
        phone: '(11) 98765-4321',
        email: 'contato@shopflow-centro.com.br',
        cnpj: '12.345.678/0001-90',
        maxCapacity: 150,
        operatingHours: {
          monday: { open: '09:00', close: '19:00', enabled: true },
          tuesday: { open: '09:00', close: '19:00', enabled: true },
          wednesday: { open: '09:00', close: '19:00', enabled: true },
          thursday: { open: '09:00', close: '19:00', enabled: true },
          friday: { open: '09:00', close: '20:00', enabled: true },
          saturday: { open: '09:00', close: '18:00', enabled: true },
          sunday: { open: '10:00', close: '16:00', enabled: false },
        },
        zones: [
          {
            id: '1',
            name: 'Entrada Principal',
            description: 'Área de entrada e recepção de clientes',
            color: '#ef4444'
          }
        ]
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
      // Mock data - integrar com backend health check
      return {
        uptime: '99.9%',
        dataUsage: '2.3GB',
        activeUsers: 156,
        lastBackup: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        systemHealth: 'healthy',
        components: {
          database: true,
          ai_engine: true,
          cameras: true,
          analytics: true
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
      // Mock data - integrar com backend compliance
      return {
        lgpdCompliant: true,
        gdprCompliant: false,
        dataRetentionPeriod: 90,
        encryptedDataPercentage: 100,
        auditLogsEnabled: true,
        lastAudit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
        rightsRequests: {
          access: 5,
          correction: 2,
          deletion: 1
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