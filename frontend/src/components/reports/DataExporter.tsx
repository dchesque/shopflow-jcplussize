'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Download, Database, FileType, Calendar, Clock, 
  Users, Activity, BarChart3, Settings, Filter,
  CheckCircle2, AlertCircle, Upload, File,
  HardDrive, Zap, Shield
} from 'lucide-react'

interface DataSource {
  id: string
  name: string
  description: string
  icon: any
  category: string
  recordCount: number
  lastUpdated: string
  size: string
  available: boolean
}

interface ExportFormat {
  id: string
  name: string
  extension: string
  description: string
  maxRecords: number
  features: string[]
}

interface ExportJob {
  id: string
  name: string
  sources: string[]
  format: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  createdAt: string
  completedAt?: string
  downloadUrl?: string
  fileSize?: string
}

const dataSources: DataSource[] = [
  {
    id: 'employees',
    name: 'Funcionários',
    description: 'Dados completos de funcionários, incluindo presença e performance',
    icon: Users,
    category: 'RH',
    recordCount: 47,
    lastUpdated: '2025-09-07T14:30:00Z',
    size: '2.1 MB',
    available: true
  },
  {
    id: 'camera_events',
    name: 'Eventos de Câmera',
    description: 'Registros de detecções e análises de comportamento',
    icon: Activity,
    category: 'Analytics',
    recordCount: 15847,
    lastUpdated: '2025-09-07T15:45:00Z',
    size: '156.3 MB',
    available: true
  },
  {
    id: 'metrics',
    name: 'Métricas e KPIs',
    description: 'Dados agregados de performance e métricas calculadas',
    icon: BarChart3,
    category: 'Analytics',
    recordCount: 3241,
    lastUpdated: '2025-09-07T15:50:00Z',
    size: '18.7 MB',
    available: true
  },
  {
    id: 'system_logs',
    name: 'Logs do Sistema',
    description: 'Registros de auditoria e logs de segurança (LGPD)',
    icon: Shield,
    category: 'Sistema',
    recordCount: 28456,
    lastUpdated: '2025-09-07T15:55:00Z',
    size: '89.2 MB',
    available: true
  },
  {
    id: 'backups',
    name: 'Backups de Dados',
    description: 'Arquivos de backup automáticos do sistema',
    icon: HardDrive,
    category: 'Sistema',
    recordCount: 24,
    lastUpdated: '2025-09-07T02:00:00Z',
    size: '1.2 GB',
    available: false
  }
]

const exportFormats: ExportFormat[] = [
  {
    id: 'csv',
    name: 'CSV',
    extension: '.csv',
    description: 'Valores separados por vírgula - compatível com Excel',
    maxRecords: 1000000,
    features: ['Leve', 'Universal', 'Estruturado']
  },
  {
    id: 'excel',
    name: 'Excel',
    extension: '.xlsx',
    description: 'Planilha Microsoft Excel com formatação e gráficos',
    maxRecords: 100000,
    features: ['Formatado', 'Gráficos', 'Múltiplas Abas']
  },
  {
    id: 'json',
    name: 'JSON',
    extension: '.json',
    description: 'Formato JSON estruturado para desenvolvimento',
    maxRecords: 50000,
    features: ['Estruturado', 'APIs', 'Aninhado']
  },
  {
    id: 'pdf',
    name: 'PDF',
    extension: '.pdf',
    description: 'Documento formatado para visualização e impressão',
    maxRecords: 10000,
    features: ['Visual', 'Impressão', 'Relatório']
  }
]

const mockExportJobs: ExportJob[] = [
  {
    id: '1',
    name: 'Export Funcionários - Setembro 2025',
    sources: ['employees', 'metrics'],
    format: 'excel',
    status: 'completed',
    progress: 100,
    createdAt: '2025-09-07T10:30:00Z',
    completedAt: '2025-09-07T10:32:15Z',
    downloadUrl: '/exports/employees-sept-2025.xlsx',
    fileSize: '4.2 MB'
  },
  {
    id: '2',
    name: 'Backup Completo - Weekly',
    sources: ['employees', 'camera_events', 'metrics', 'system_logs'],
    format: 'json',
    status: 'running',
    progress: 67,
    createdAt: '2025-09-07T15:00:00Z'
  },
  {
    id: '3',
    name: 'Analytics Report - Q3 2025',
    sources: ['camera_events', 'metrics'],
    format: 'pdf',
    status: 'failed',
    progress: 0,
    createdAt: '2025-09-06T14:20:00Z'
  }
]

interface DataExporterProps {
  dataSources?: DataSource[]
  exportJobs?: ExportJob[]
  onStartExport?: (config: any) => Promise<void>
}

export function DataExporter({ 
  dataSources: propDataSources = dataSources,
  exportJobs: propExportJobs = mockExportJobs,
  onStartExport
}: DataExporterProps) {
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [selectedFormat, setSelectedFormat] = useState<string>('')
  const [exportName, setExportName] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [isExporting, setIsExporting] = useState(false)
  const [activeTab, setActiveTab] = useState<'export' | 'jobs' | 'bulk'>('export')

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    )
  }

  const handleStartExport = async () => {
    if (!selectedFormat || selectedSources.length === 0 || !exportName.trim()) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    setIsExporting(true)
    try {
      const config = {
        name: exportName,
        sources: selectedSources,
        format: selectedFormat,
        dateRange: dateRange.start && dateRange.end ? dateRange : null
      }

      await onStartExport?.(config)
      
      // Reset form
      setSelectedSources([])
      setSelectedFormat('')
      setExportName('')
      setDateRange({ start: '', end: '' })
      
    } catch (error) {
      console.error('Erro ao iniciar exportação:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const getTotalRecords = () => {
    return selectedSources.reduce((total, sourceId) => {
      const source = propDataSources.find(s => s.id === sourceId)
      return total + (source?.recordCount || 0)
    }, 0)
  }

  const getTotalSize = () => {
    const totalMB = selectedSources.reduce((total, sourceId) => {
      const source = propDataSources.find(s => s.id === sourceId)
      if (!source) return total
      
      const size = parseFloat(source.size.replace(/[^\d.]/g, ''))
      const unit = source.size.includes('GB') ? 1024 : 1
      
      return total + (size * unit)
    }, 0)
    
    return totalMB > 1024 ? `${(totalMB / 1024).toFixed(1)} GB` : `${totalMB.toFixed(1)} MB`
  }

  const getStatusConfig = (status: ExportJob['status']) => {
    const configs = {
      pending: { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-600', icon: Clock },
      running: { label: 'Executando', color: 'bg-blue-500/10 text-blue-600', icon: Zap },
      completed: { label: 'Concluído', color: 'bg-green-500/10 text-green-600', icon: CheckCircle2 },
      failed: { label: 'Falhou', color: 'bg-red-500/10 text-red-600', icon: AlertCircle }
    }
    return configs[status]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Database className="h-6 w-6" />
            Exportação de Dados
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Exporte dados completos em diversos formatos para análise externa
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export" className="gap-2">
            <Download className="h-4 w-4" />
            Nova Exportação
          </TabsTrigger>
          <TabsTrigger value="jobs" className="gap-2">
            <Activity className="h-4 w-4" />
            Jobs de Exportação
          </TabsTrigger>
          <TabsTrigger value="bulk" className="gap-2">
            <Upload className="h-4 w-4" />
            Exportação em Massa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Export Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Configurações da Exportação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="export-name">Nome da Exportação</Label>
                    <Input
                      id="export-name"
                      value={exportName}
                      onChange={(e) => setExportName(e.target.value)}
                      placeholder="Digite um nome para identificar esta exportação"
                    />
                  </div>

                  <div>
                    <Label>Formato de Exportação</Label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o formato" />
                      </SelectTrigger>
                      <SelectContent>
                        {exportFormats.map(format => (
                          <SelectItem key={format.id} value={format.id}>
                            <div className="flex items-center gap-2">
                              <FileType className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{format.name}</div>
                                <div className="text-xs text-gray-500">
                                  {format.description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date">Data Inicial (opcional)</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date">Data Final (opcional)</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Sources */}
              <Card>
                <CardHeader>
                  <CardTitle>Fontes de Dados</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Selecione os dados que deseja exportar
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {propDataSources.map(source => (
                      <motion.div
                        key={source.id}
                        whileHover={{ scale: 1.02 }}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedSources.includes(source.id)
                            ? 'border-blue-500 bg-blue-500/5'
                            : 'border-gray-200 dark:border-gray-700'
                        } ${!source.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => source.available && handleSourceToggle(source.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedSources.includes(source.id)}
                            disabled={!source.available}
                            onChange={() => {}}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <source.icon className="h-5 w-5 text-gray-500" />
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {source.name}
                              </h3>
                              <Badge variant="secondary" className="text-xs">
                                {source.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {source.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{source.recordCount.toLocaleString()} registros</span>
                              <span>{source.size}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Última atualização: {new Date(source.lastUpdated).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Panel */}
            <div className="space-y-6">
              {/* Export Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumo da Exportação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Fontes selecionadas:</span>
                    <span className="font-medium">{selectedSources.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total de registros:</span>
                    <span className="font-medium">{getTotalRecords().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tamanho estimado:</span>
                    <span className="font-medium">{getTotalSize()}</span>
                  </div>
                  {selectedFormat && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Formato:</span>
                      <span className="font-medium">
                        {exportFormats.find(f => f.id === selectedFormat)?.name}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Format Features */}
              {selectedFormat && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Características do Formato</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const format = exportFormats.find(f => f.id === selectedFormat)
                      return format ? (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {format.description}
                          </p>
                          <div>
                            <Label className="text-xs text-gray-500">RECURSOS</Label>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {format.features.map(feature => (
                                <Badge key={feature} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Máx. registros:
                            </span>
                            <span className="text-sm font-medium">
                              {format.maxRecords.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ) : null
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Export Button */}
              <Button
                onClick={handleStartExport}
                disabled={!selectedFormat || selectedSources.length === 0 || !exportName.trim() || isExporting}
                className="w-full gap-2"
                size="lg"
              >
                {isExporting ? (
                  <>Iniciando Exportação...</>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Iniciar Exportação
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Jobs de Exportação</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Acompanhe o progresso das suas exportações
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {propExportJobs.map(job => {
                  const statusConfig = getStatusConfig(job.status)
                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {job.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={statusConfig.color}>
                              <statusConfig.icon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {job.sources.length} fonte(s)
                            </span>
                          </div>
                        </div>
                        
                        {job.status === 'completed' && job.downloadUrl && (
                          <Button variant="outline" size="sm" className="gap-2">
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        )}
                      </div>

                      {job.status === 'running' && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progresso</span>
                            <span>{job.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>
                          Iniciado: {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        {job.fileSize && (
                          <span>{job.fileSize}</span>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exportação em Massa</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure exportações automáticas e backups completos
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <HardDrive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Em Desenvolvimento
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Esta funcionalidade estará disponível na próxima versão
                </p>
                <Button variant="outline">
                  Notificar quando disponível
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}