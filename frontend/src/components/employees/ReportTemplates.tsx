'use client'

import { useState } from 'react'
import { format, subDays, subWeeks, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FileText, Calendar, TrendingUp, Users, Download, Eye, Settings, Clock, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: any
  category: 'daily' | 'weekly' | 'monthly' | 'custom'
  metrics: string[]
  chartType: string
  groupBy: string
  defaultDateRange: {
    days: number
    type: string
  }
  includeComparisons: boolean
  includeTrends: boolean
  preset: boolean
}

interface ReportTemplatesProps {
  onGenerateReport: (template: ReportTemplate, customParams?: any) => void
  onEditTemplate?: (template: ReportTemplate) => void
  customTemplates?: ReportTemplate[]
}

const presetTemplates: ReportTemplate[] = [
  {
    id: 'daily_attendance',
    name: 'Relatório Diário de Presença',
    description: 'Controle diário de presença, atrasos e ausências dos funcionários',
    icon: Calendar,
    category: 'daily',
    metrics: ['attendance_rate', 'late_arrivals', 'early_departures', 'absent_count'],
    chartType: 'table',
    groupBy: 'employee',
    defaultDateRange: { days: 1, type: 'today' },
    includeComparisons: false,
    includeTrends: false,
    preset: true
  },
  {
    id: 'weekly_productivity',
    name: 'Análise Semanal de Produtividade',
    description: 'Métricas de produtividade, horas trabalhadas e eficiência por semana',
    icon: TrendingUp,
    category: 'weekly',
    metrics: ['hours_worked', 'overtime_hours', 'productivity_score', 'efficiency_rate'],
    chartType: 'bar',
    groupBy: 'day',
    defaultDateRange: { days: 7, type: 'week' },
    includeComparisons: true,
    includeTrends: true,
    preset: true
  },
  {
    id: 'monthly_hr_summary',
    name: 'Resumo Mensal de RH',
    description: 'Visão geral completa de todas as métricas de RH do mês',
    icon: Users,
    category: 'monthly',
    metrics: ['attendance_rate', 'hours_worked', 'overtime_hours', 'break_duration', 'zone_usage', 'productivity_score'],
    chartType: 'line',
    groupBy: 'week',
    defaultDateRange: { days: 30, type: 'month' },
    includeComparisons: true,
    includeTrends: true,
    preset: true
  },
  {
    id: 'zone_activity_analysis',
    name: 'Análise de Atividade por Zona',
    description: 'Padrões de movimento e uso de diferentes áreas da loja',
    icon: MapPin,
    category: 'weekly',
    metrics: ['zone_usage', 'zone_transitions', 'dwell_time'],
    chartType: 'pie',
    groupBy: 'zone',
    defaultDateRange: { days: 7, type: 'week' },
    includeComparisons: false,
    includeTrends: false,
    preset: true
  },
  {
    id: 'break_patterns',
    name: 'Padrões de Intervalo',
    description: 'Análise dos padrões de pausa e intervalo dos funcionários',
    icon: Clock,
    category: 'weekly',
    metrics: ['break_duration', 'break_frequency', 'break_timing'],
    chartType: 'bar',
    groupBy: 'hour',
    defaultDateRange: { days: 7, type: 'week' },
    includeComparisons: true,
    includeTrends: true,
    preset: true
  },
  {
    id: 'overtime_analysis',
    name: 'Análise de Horas Extra',
    description: 'Detalhamento das horas extra por funcionário e departamento',
    icon: Clock,
    category: 'monthly',
    metrics: ['overtime_hours', 'overtime_frequency', 'overtime_cost'],
    chartType: 'bar',
    groupBy: 'employee',
    defaultDateRange: { days: 30, type: 'month' },
    includeComparisons: true,
    includeTrends: true,
    preset: true
  }
]

const categoryInfo = {
  daily: { label: 'Diário', color: 'bg-blue-500' },
  weekly: { label: 'Semanal', color: 'bg-green-500' },
  monthly: { label: 'Mensal', color: 'bg-purple-500' },
  custom: { label: 'Personalizado', color: 'bg-orange-500' }
}

export function ReportTemplates({ 
  onGenerateReport, 
  onEditTemplate,
  customTemplates = []
}: ReportTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const allTemplates = [...presetTemplates, ...customTemplates]
  
  const filteredTemplates = selectedCategory === 'all' 
    ? allTemplates 
    : allTemplates.filter(t => t.category === selectedCategory)

  const handleGenerateReport = (template: ReportTemplate) => {
    onGenerateReport(template)
  }

  const handlePreview = (template: ReportTemplate) => {
    setSelectedTemplate(template)
    setShowPreview(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Templates de Relatório
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Use templates pré-configurados ou crie seus próprios relatórios
          </p>
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="daily">Diário</SelectItem>
            <SelectItem value="weekly">Semanal</SelectItem>
            <SelectItem value="monthly">Mensal</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => {
          const IconComponent = template.icon
          const categoryData = categoryInfo[template.category]
          
          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${categoryData.color} bg-opacity-10`}>
                      <IconComponent className={`h-5 w-5 ${categoryData.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg leading-tight">
                        {template.name}
                      </CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {categoryData.label}
                      </Badge>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {template.description}
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Métricas:</span>
                      <div className="font-medium">{template.metrics.length}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Período:</span>
                      <div className="font-medium">
                        {template.defaultDateRange.days === 1 
                          ? 'Hoje' 
                          : `${template.defaultDateRange.days} dias`
                        }
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleGenerateReport(template)}
                      className="flex-1 gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Gerar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(template)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {!template.preset && onEditTemplate && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditTemplate(template)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Relatórios Rápidos
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gere relatórios comuns com um clique
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm"
                onClick={() => handleGenerateReport(presetTemplates[0])}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Presença Hoje
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => handleGenerateReport(presetTemplates[1])}
                className="gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Semana Atual
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => handleGenerateReport(presetTemplates[2])}
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                Mês Atual
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview do Template</DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${categoryInfo[selectedTemplate.category].color} bg-opacity-10`}>
                  <selectedTemplate.icon className={`h-6 w-6 ${categoryInfo[selectedTemplate.category].color.replace('bg-', 'text-')}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedTemplate.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {selectedTemplate.description}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {categoryInfo[selectedTemplate.category].label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Configurações</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tipo de Gráfico:</span>
                      <span className="font-medium capitalize">{selectedTemplate.chartType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Agrupamento:</span>
                      <span className="font-medium capitalize">{selectedTemplate.groupBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Período Padrão:</span>
                      <span className="font-medium">{selectedTemplate.defaultDateRange.days} dias</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Comparações:</span>
                      <span className="font-medium">
                        {selectedTemplate.includeComparisons ? 'Sim' : 'Não'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tendências:</span>
                      <span className="font-medium">
                        {selectedTemplate.includeTrends ? 'Sim' : 'Não'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Métricas Incluídas</h4>
                  <div className="space-y-2">
                    {selectedTemplate.metrics.map(metric => (
                      <div key={metric} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="text-sm capitalize">
                          {metric.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Fechar
                </Button>
                <Button onClick={() => {
                  handleGenerateReport(selectedTemplate)
                  setShowPreview(false)
                }}>
                  Gerar Relatório
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}