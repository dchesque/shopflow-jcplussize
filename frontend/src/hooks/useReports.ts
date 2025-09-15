'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'

// Report Configuration Types
export interface ReportConfig {
  title: string
  description?: string
  dateRange: {
    start: Date
    end: Date
    preset?: string
  }
  metrics: string[]
  groupBy: string
  chartType: string
  includeComparisons: boolean
  includeTrends: boolean
  breakdownBy?: string[]
  filters?: Record<string, any>
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  config: ReportConfig
  created_at: Date
  updated_at: Date
  is_preset: boolean
}

export interface GeneratedReport {
  id: string
  title: string
  config: ReportConfig
  data: any
  generated_at: Date
  download_url?: string
  file_size?: number
  format: 'pdf' | 'excel' | 'csv'
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

// Query Keys
export const reportKeys = {
  all: ['reports'] as const,
  templates: () => [...reportKeys.all, 'templates'] as const,
  template: (id: string) => [...reportKeys.templates(), id] as const,
  generated: () => [...reportKeys.all, 'generated'] as const,
  report: (id: string) => [...reportKeys.generated(), id] as const,
}

// Mock data
const mockTemplates: ReportTemplate[] = [
  {
    id: 'daily_attendance',
    name: 'Relatório Diário de Presença',
    description: 'Controle diário de presença dos funcionários',
    config: {
      title: 'Relatório Diário de Presença',
      dateRange: { start: new Date(), end: new Date() },
      metrics: ['attendance_rate', 'late_arrivals', 'absent_count'],
      groupBy: 'employee',
      chartType: 'table',
      includeComparisons: false,
      includeTrends: false
    },
    created_at: new Date(),
    updated_at: new Date(),
    is_preset: true
  },
  {
    id: 'weekly_productivity',
    name: 'Análise Semanal de Produtividade',
    description: 'Métricas de produtividade por semana',
    config: {
      title: 'Análise Semanal de Produtividade',
      dateRange: { start: new Date(), end: new Date() },
      metrics: ['hours_worked', 'overtime_hours', 'productivity_score'],
      groupBy: 'week',
      chartType: 'bar',
      includeComparisons: true,
      includeTrends: true
    },
    created_at: new Date(),
    updated_at: new Date(),
    is_preset: true
  }
]

// API Functions (Mock implementations)
async function fetchReportTemplates(): Promise<ReportTemplate[]> {
  // Mock API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // In production:
  // const response = await fetch(`${API_BASE_URL}/api/reports/templates`)
  // if (!response.ok) throw new Error('Failed to fetch report templates')
  // return response.json()
  
  return mockTemplates
}

async function saveReportTemplate(config: ReportConfig, name: string): Promise<ReportTemplate> {
  // Mock API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // In production:
  // const response = await fetch(`${API_BASE_URL}/api/reports/templates`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ name, description: config.description, config })
  // })
  // if (!response.ok) throw new Error('Failed to save template')
  // return response.json()
  
  const newTemplate: ReportTemplate = {
    id: `custom_${Date.now()}`,
    name,
    description: config.description || '',
    config,
    created_at: new Date(),
    updated_at: new Date(),
    is_preset: false
  }
  
  return newTemplate
}

async function generateReport(config: ReportConfig, format: 'pdf' | 'excel' | 'csv' = 'pdf'): Promise<GeneratedReport> {
  // Mock API delay for report generation
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // In production:
  // const response = await fetch(`${API_BASE_URL}/api/reports/generate`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ config, format })
  // })
  // if (!response.ok) throw new Error('Failed to generate report')
  // return response.json()
  
  const mockReport: GeneratedReport = {
    id: `report_${Date.now()}`,
    title: config.title,
    config,
    data: generateMockReportData(config),
    generated_at: new Date(),
    download_url: `/api/reports/download/report_${Date.now()}.${format}`,
    file_size: Math.floor(Math.random() * 5000000) + 100000, // 100KB - 5MB
    format
  }
  
  return mockReport
}

function generateMockReportData(config: ReportConfig) {
  // Generate mock data based on the report configuration
  const data: any = {
    summary: {
      total_employees: 25,
      active_employees: 23,
      period: `${format(config.dateRange.start, 'dd/MM/yyyy')} - ${format(config.dateRange.end, 'dd/MM/yyyy')}`,
      generated_at: new Date().toISOString()
    },
    metrics: {},
    charts: []
  }

  // Generate mock metrics based on selected metrics
  config.metrics.forEach(metric => {
    switch (metric) {
      case 'attendance_rate':
        data.metrics.attendance_rate = {
          value: 92.5,
          unit: '%',
          trend: '+2.3%',
          comparison: 'vs last period'
        }
        break
      case 'hours_worked':
        data.metrics.hours_worked = {
          value: 1840,
          unit: 'horas',
          trend: '+5.2%',
          comparison: 'vs last period'
        }
        break
      case 'overtime_hours':
        data.metrics.overtime_hours = {
          value: 120,
          unit: 'horas',
          trend: '-8.1%',
          comparison: 'vs last period'
        }
        break
      case 'productivity_score':
        data.metrics.productivity_score = {
          value: 87.3,
          unit: 'pontos',
          trend: '+1.7%',
          comparison: 'vs last period'
        }
        break
    }
  })

  return data
}

async function deleteReportTemplate(id: string): Promise<void> {
  // Mock API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // In production:
  // const response = await fetch(`${API_BASE_URL}/api/reports/templates/${id}`, {
  //   method: 'DELETE'
  // })
  // if (!response.ok) throw new Error('Failed to delete template')
  
  console.log(`Template ${id} deleted`)
}

async function exportReportData(config: ReportConfig, format: 'excel' | 'csv'): Promise<Blob> {
  // Mock API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // In production:
  // const response = await fetch(`${API_BASE_URL}/api/reports/export`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ config, format })
  // })
  // if (!response.ok) throw new Error('Failed to export report')
  // return response.blob()
  
  // Mock CSV/Excel data
  const mockCsvData = `Nome,Departamento,Horas Trabalhadas,Presença
João Silva,Vendas,40,100%
Maria Santos,Vendas,38,95%
Pedro Costa,Estoque,42,100%
Ana Paula,Caixa,40,100%`
  
  return new Blob([mockCsvData], { 
    type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  })
}

// Hooks
export function useReportTemplates() {
  const query = useQuery({
    queryKey: reportKeys.templates(),
    queryFn: fetchReportTemplates,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })

  return {
    templates: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useSaveReportTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ config, name }: { config: ReportConfig; name: string }) =>
      saveReportTemplate(config, name),
    onSuccess: (newTemplate) => {
      // Add the new template to the cache
      queryClient.setQueryData<ReportTemplate[]>(
        reportKeys.templates(),
        (old = []) => [...old, newTemplate]
      )
    },
  })
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: ({ config, format }: { config: ReportConfig; format?: 'pdf' | 'excel' | 'csv' }) =>
      generateReport(config, format),
    onSuccess: (report) => {
      // Optionally trigger download
      if (report.download_url) {
        window.open(report.download_url, '_blank')
      }
    },
  })
}

export function useDeleteReportTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteReportTemplate,
    onSuccess: (_, deletedId) => {
      // Remove the template from cache
      queryClient.setQueryData<ReportTemplate[]>(
        reportKeys.templates(),
        (old = []) => old.filter(template => template.id !== deletedId)
      )
    },
  })
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({ config, format }: { config: ReportConfig; format: 'excel' | 'csv' }) =>
      exportReportData(config, format),
    onSuccess: (blob, { format }) => {
      // Trigger download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `relatorio-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    },
  })
}

// Utility functions
export function downloadReport(report: GeneratedReport) {
  if (report.download_url) {
    window.open(report.download_url, '_blank')
  }
}

export function getReportSummary(report: GeneratedReport) {
  return {
    totalMetrics: Object.keys(report.data?.metrics || {}).length,
    fileSize: report.file_size ? `${(report.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A',
    generatedAt: format(report.generated_at, 'dd/MM/yyyy HH:mm'),
    period: `${format(report.config.dateRange.start, 'dd/MM')} - ${format(report.config.dateRange.end, 'dd/MM')}`,
  }
}