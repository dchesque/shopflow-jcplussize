'use client'

import { useState } from 'react'
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Download, FileText, BarChart3, PieChart, TrendingUp, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface MetricOption {
  id: string
  name: string
  category: string
  description: string
  unit?: string
  chartTypes: string[]
}

interface ReportConfig {
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

interface ReportBuilderProps {
  availableMetrics: MetricOption[]
  onGenerateReport: (config: ReportConfig) => Promise<void>
  onSaveTemplate?: (config: ReportConfig, templateName: string) => void
  templates?: Array<{ id: string; name: string; config: ReportConfig }>
}

const datePresets = [
  { value: '7d', label: 'Últimos 7 dias', days: 7 },
  { value: '30d', label: 'Últimos 30 dias', days: 30 },
  { value: '90d', label: 'Últimos 90 dias', days: 90 },
  { value: '1y', label: 'Último ano', days: 365 },
  { value: 'custom', label: 'Personalizado', days: 0 }
]

const groupByOptions = [
  { value: 'day', label: 'Por Dia' },
  { value: 'week', label: 'Por Semana' },
  { value: 'month', label: 'Por Mês' },
  { value: 'employee', label: 'Por Funcionário' },
  { value: 'department', label: 'Por Departamento' },
  { value: 'shift', label: 'Por Turno' }
]

const chartTypes = [
  { value: 'bar', label: 'Gráfico de Barras', icon: BarChart3 },
  { value: 'line', label: 'Gráfico de Linha', icon: TrendingUp },
  { value: 'pie', label: 'Gráfico de Pizza', icon: PieChart },
  { value: 'area', label: 'Gráfico de Área', icon: BarChart3 },
  { value: 'table', label: 'Tabela', icon: FileText }
]

const mockMetrics: MetricOption[] = [
  {
    id: 'attendance_rate',
    name: 'Taxa de Presença',
    category: 'Presença',
    description: 'Percentual de presença dos funcionários',
    unit: '%',
    chartTypes: ['bar', 'line', 'area']
  },
  {
    id: 'hours_worked',
    name: 'Horas Trabalhadas',
    category: 'Produtividade',
    description: 'Total de horas trabalhadas',
    unit: 'horas',
    chartTypes: ['bar', 'line', 'area', 'table']
  },
  {
    id: 'overtime_hours',
    name: 'Horas Extra',
    category: 'Produtividade',
    description: 'Horas trabalhadas além da jornada normal',
    unit: 'horas',
    chartTypes: ['bar', 'line', 'area']
  },
  {
    id: 'break_duration',
    name: 'Tempo de Pausa',
    category: 'Padrões',
    description: 'Duração total das pausas',
    unit: 'minutos',
    chartTypes: ['bar', 'line', 'area']
  },
  {
    id: 'zone_usage',
    name: 'Uso de Zonas',
    category: 'Padrões',
    description: 'Distribuição de tempo por zona da loja',
    unit: '%',
    chartTypes: ['pie', 'bar', 'table']
  },
  {
    id: 'productivity_score',
    name: 'Score de Produtividade',
    category: 'Produtividade',
    description: 'Métrica calculada de produtividade',
    unit: 'pontos',
    chartTypes: ['line', 'bar', 'area']
  }
]

export function ReportBuilder({
  availableMetrics = mockMetrics,
  onGenerateReport,
  onSaveTemplate,
  templates = []
}: ReportBuilderProps) {
  const [config, setConfig] = useState<ReportConfig>({
    title: 'Relatório Personalizado',
    description: '',
    dateRange: {
      start: subDays(new Date(), 30),
      end: new Date(),
      preset: '30d'
    },
    metrics: [],
    groupBy: 'day',
    chartType: 'bar',
    includeComparisons: false,
    includeTrends: true,
    breakdownBy: [],
    filters: {}
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [templateName, setTemplateName] = useState('')

  // Group metrics by category
  const metricsByCategory = availableMetrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = []
    }
    acc[metric.category].push(metric)
    return acc
  }, {} as Record<string, MetricOption[]>)

  const handleDatePresetChange = (preset: string) => {
    if (preset === 'custom') {
      setConfig(prev => ({
        ...prev,
        dateRange: { ...prev.dateRange, preset }
      }))
    } else {
      const presetData = datePresets.find(p => p.value === preset)
      if (presetData) {
        setConfig(prev => ({
          ...prev,
          dateRange: {
            start: subDays(new Date(), presetData.days),
            end: new Date(),
            preset
          }
        }))
      }
    }
  }

  const handleMetricToggle = (metricId: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      metrics: checked 
        ? [...prev.metrics, metricId]
        : prev.metrics.filter(id => id !== metricId)
    }))
  }

  const handleGenerateReport = async () => {
    if (config.metrics.length === 0) {
      alert('Selecione pelo menos uma métrica para gerar o relatório.')
      return
    }

    setIsGenerating(true)
    try {
      await onGenerateReport(config)
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('Digite um nome para o template.')
      return
    }

    onSaveTemplate?.(config, templateName)
    setShowSaveDialog(false)
    setTemplateName('')
  }

  const loadTemplate = (template: { config: ReportConfig }) => {
    setConfig(template.config)
  }

  const selectedMetrics = availableMetrics.filter(m => config.metrics.includes(m.id))
  const availableChartTypes = config.metrics.length > 0 
    ? chartTypes.filter(chart => 
        selectedMetrics.some(metric => metric.chartTypes.includes(chart.value))
      )
    : chartTypes

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Construtor de Relatórios
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Crie relatórios personalizados de analytics de funcionários
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSaveDialog(true)}
            disabled={config.metrics.length === 0}
          >
            Salvar Template
          </Button>
          <Button
            onClick={handleGenerateReport}
            disabled={config.metrics.length === 0 || isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>Gerando...</>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Gerar Relatório
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título do Relatório</Label>
                <Input
                  id="title"
                  value={config.title}
                  onChange={e => setConfig(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nome do relatório"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  value={config.description}
                  onChange={e => setConfig(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o objetivo deste relatório"
                  rows={3}
                />
              </div>

              {/* Date Range */}
              <div>
                <Label>Período</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <Select 
                    value={config.dateRange.preset || 'custom'} 
                    onValueChange={handleDatePresetChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {datePresets.map(preset => (
                        <SelectItem key={preset.value} value={preset.value}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {config.dateRange.preset === 'custom' && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {format(config.dateRange.start, 'dd/MM/yyyy')} - {format(config.dateRange.end, 'dd/MM/yyyy')}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Selecione as métricas que deseja incluir no relatório
              </p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={Object.keys(metricsByCategory)[0]} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  {Object.keys(metricsByCategory).map(category => (
                    <TabsTrigger key={category} value={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(metricsByCategory).map(([category, metrics]) => (
                  <TabsContent key={category} value={category} className="space-y-3">
                    {metrics.map(metric => (
                      <div key={metric.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={metric.id}
                          checked={config.metrics.includes(metric.id)}
                          onCheckedChange={(checked) => 
                            handleMetricToggle(metric.id, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor={metric.id} 
                            className="text-sm font-medium cursor-pointer"
                          >
                            {metric.name}
                            {metric.unit && (
                              <span className="text-gray-500 ml-1">({metric.unit})</span>
                            )}
                          </Label>
                          <p className="text-xs text-gray-500 mt-1">
                            {metric.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Display Options */}
          <Card>
            <CardHeader>
              <CardTitle>Opções de Exibição</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Agrupar Por</Label>
                  <Select 
                    value={config.groupBy} 
                    onValueChange={value => setConfig(prev => ({ ...prev, groupBy: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {groupByOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tipo de Gráfico</Label>
                  <Select 
                    value={config.chartType} 
                    onValueChange={value => setConfig(prev => ({ ...prev, chartType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableChartTypes.map(chart => (
                        <SelectItem key={chart.value} value={chart.value}>
                          <div className="flex items-center gap-2">
                            <chart.icon className="h-4 w-4" />
                            {chart.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="comparisons"
                    checked={config.includeComparisons}
                    onCheckedChange={checked => 
                      setConfig(prev => ({ ...prev, includeComparisons: checked }))
                    }
                  />
                  <Label htmlFor="comparisons">Incluir comparações de período</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="trends"
                    checked={config.includeTrends}
                    onCheckedChange={checked => 
                      setConfig(prev => ({ ...prev, includeTrends: checked }))
                    }
                  />
                  <Label htmlFor="trends">Mostrar linhas de tendência</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          {/* Selected Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Métricas Selecionadas</CardTitle>
            </CardHeader>
            <CardContent>
              {config.metrics.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nenhuma métrica selecionada
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedMetrics.map(metric => (
                    <div key={metric.id} className="flex items-center justify-between">
                      <span className="text-sm">{metric.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {metric.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Templates */}
          {templates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Templates Salvos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {templates.map(template => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => loadTemplate(template)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {template.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Report Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuração Atual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-gray-500">TÍTULO</Label>
                <p className="text-sm font-medium">{config.title}</p>
              </div>

              <div>
                <Label className="text-xs text-gray-500">PERÍODO</Label>
                <p className="text-sm">
                  {format(config.dateRange.start, 'dd/MM/yyyy', { locale: ptBR })} - {format(config.dateRange.end, 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>

              <div>
                <Label className="text-xs text-gray-500">AGRUPAMENTO</Label>
                <p className="text-sm">
                  {groupByOptions.find(o => o.value === config.groupBy)?.label}
                </p>
              </div>

              <div>
                <Label className="text-xs text-gray-500">VISUALIZAÇÃO</Label>
                <p className="text-sm">
                  {chartTypes.find(c => c.value === config.chartType)?.label}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Nome do Template</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                placeholder="Digite um nome para o template"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveTemplate}>
                Salvar Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}