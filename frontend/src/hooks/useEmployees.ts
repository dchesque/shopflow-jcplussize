'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Employee, 
  EmployeeCreateRequest, 
  EmployeeUpdateRequest, 
  EmployeesListResponse, 
  EmployeeFilters,
  EmployeeAnalytics 
} from '@/types/employee'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

// Query Keys
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (filters: EmployeeFilters) => [...employeeKeys.lists(), filters] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
  analytics: (id: string) => [...employeeKeys.all, 'analytics', id] as const,
}

// API Functions
async function fetchEmployees(filters: EmployeeFilters = {}): Promise<EmployeesListResponse> {
  const params = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value))
    }
  })

  const response = await fetch(`${API_BASE_URL}/api/employees/list?${params}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Falha ao buscar funcionários')
  }

  return response.json()
}

async function fetchEmployee(id: string): Promise<Employee> {
  const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Funcionário não encontrado')
    }
    throw new Error('Falha ao buscar funcionário')
  }

  return response.json()
}

async function fetchEmployeeAnalytics(id: string): Promise<EmployeeAnalytics> {
  const response = await fetch(`${API_BASE_URL}/api/employees/${id}/analytics`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Falha ao buscar analytics do funcionário')
  }

  return response.json()
}

async function createEmployee(data: EmployeeCreateRequest): Promise<Employee> {
  const formData = new FormData()
  
  // Add form fields
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'photo_file' && value) {
      formData.append('photo', value as File)
    } else if (typeof value === 'object' && value !== null) {
      formData.append(key, JSON.stringify(value))
    } else if (value !== undefined && value !== '') {
      formData.append(key, String(value))
    }
  })

  const response = await fetch(`${API_BASE_URL}/api/employees/register`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Falha ao criar funcionário')
  }

  return response.json()
}

async function updateEmployee(data: EmployeeUpdateRequest): Promise<Employee> {
  const formData = new FormData()
  
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'photo_file' && value) {
      formData.append('photo', value as File)
    } else if (key === 'id') {
      // Skip ID in form data
      return
    } else if (typeof value === 'object' && value !== null) {
      formData.append(key, JSON.stringify(value))
    } else if (value !== undefined && value !== '') {
      formData.append(key, String(value))
    }
  })

  const response = await fetch(`${API_BASE_URL}/api/employees/${data.id}`, {
    method: 'PUT',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Falha ao atualizar funcionário')
  }

  return response.json()
}

async function deleteEmployee(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Falha ao excluir funcionário')
  }
}

// Hooks
export function useEmployees(filters: EmployeeFilters = {}) {
  const query = useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: () => fetchEmployees(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    employees: query.data?.employees,
    totalCount: query.data?.total_count,
    activeCount: query.data?.active_count,
    inactiveCount: query.data?.inactive_count,
    page: query.data?.page,
    limit: query.data?.limit,
    hasNext: query.data?.has_next,
    hasPrev: query.data?.has_prev,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useEmployee(id: string) {
  const query = useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => fetchEmployee(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  return {
    employee: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useEmployeeAnalytics(id: string) {
  const query = useQuery({
    queryKey: employeeKeys.analytics(id),
    queryFn: () => fetchEmployeeAnalytics(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 15, // 15 minutes
  })

  return {
    analytics: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      // Invalidate and refetch employees list
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateEmployee,
    onSuccess: (data) => {
      // Invalidate and refetch employees list
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
      // Update specific employee cache
      queryClient.setQueryData(employeeKeys.detail(data.id), data)
    },
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      // Invalidate and refetch employees list
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
    },
  })
}

// Utility hooks for common operations
export function useEmployeeSearch(searchTerm: string) {
  return useEmployees({
    search: searchTerm,
    limit: 20,
  })
}

export function useActiveEmployees() {
  return useEmployees({
    status: 'active',
    limit: 50,
  })
}

export function useEmployeesByDepartment(department: string) {
  return useEmployees({
    department,
    status: 'active',
    limit: 50,
  })
}