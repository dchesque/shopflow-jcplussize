export interface Employee {
  id: string
  full_name: string
  email: string
  phone?: string
  document_number: string
  document_type: 'cpf' | 'rg' | 'passport'
  position: string
  department?: string
  hire_date: string
  status: 'active' | 'inactive' | 'suspended'
  photo_url?: string
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    postal_code: string
  }
  emergency_contact?: {
    name: string
    phone: string
    relationship: string
  }
  permissions: EmployeePermission[]
  lgpd_consent: LGPDConsent
  created_at: string
  updated_at: string
}

export interface EmployeePermission {
  id: string
  resource: string
  action: 'read' | 'write' | 'delete' | 'admin'
  granted_at: string
  granted_by: string
}

export interface LGPDConsent {
  data_processing: boolean
  facial_recognition: boolean
  analytics_tracking: boolean
  marketing_communication: boolean
  data_sharing: boolean
  consent_date: string
  consent_ip?: string
  withdrawal_date?: string
}

export interface EmployeeCreateRequest {
  full_name: string
  email: string
  phone?: string
  document_number: string
  document_type: 'cpf' | 'rg' | 'passport'
  position: string
  department?: string
  hire_date: string
  photo_file?: File
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    postal_code: string
  }
  emergency_contact?: {
    name: string
    phone: string
    relationship: string
  }
  permissions: string[]
  lgpd_consent: Omit<LGPDConsent, 'consent_date' | 'consent_ip'>
}

export interface EmployeeUpdateRequest extends Partial<EmployeeCreateRequest> {
  id: string
}

export interface EmployeeAnalytics {
  total_detections: number
  daily_presence: {
    date: string
    first_detection: string
    last_detection: string
    total_hours: number
  }[]
  monthly_hours: {
    month: string
    total_hours: number
  }[]
  department_interactions: {
    department: string
    interaction_count: number
  }[]
}

export interface EmployeesListResponse {
  employees: Employee[]
  total_count: number
  active_count: number
  inactive_count: number
  page: number
  limit: number
  has_next: boolean
  has_prev: boolean
}

export interface EmployeeFilters {
  search?: string
  status?: 'active' | 'inactive' | 'suspended'
  department?: string
  position?: string
  hire_date_from?: string
  hire_date_to?: string
  page?: number
  limit?: number
  sort_by?: 'name' | 'email' | 'created_at' | 'hire_date'
  sort_order?: 'asc' | 'desc'
}