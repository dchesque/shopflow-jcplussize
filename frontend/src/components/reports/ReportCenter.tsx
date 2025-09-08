'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calendar, Clock, Download, Mail, Settings, 
  PlayCircle, Pause, FileText, BarChart3, 
  Users, TrendingUp, AlertCircle, CheckCircle2
} from 'lucide-react'

interface ScheduledReport {
  id: string
  name: string
  description: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  nextRun: string
  lastRun?: string
  isActive: boolean
  recipients: string[]
  format: 'PDF' | 'Excel' | 'CSV'
  template: string
  status: 'active' | 'paused' | 'error'
}

interface ReportCenterProps {
  scheduledReports?: ScheduledReport[]
  onToggleReport?: (reportId: string, active: boolean) => void
  onRunNow?: (reportId: string) => Promise<void>
  onEditReport?: (reportId: string) => void
}

const mockScheduledReports: ScheduledReport[] = [
  {
    id: '1',
    name: 'Relatório Diário de Operações',
    description: 'Resumo diário das métricas principais da loja',
    frequency: 'daily',
    nextRun: '2025-09-08T08:00:00Z',
    lastRun: '2025-09-07T08:00:00Z',
    isActive: true,
    recipients: ['gerente@loja.com', 'operacoes@loja.com'],
    format: 'PDF',
    template: 'daily_operations',
    status: 'active'
  },
  {
    id: '2',
    name: 'Análise Semanal de Performance',
    description: 'Análise completa de performance e produtividade',
    frequency: 'weekly',
    nextRun: '2025-09-09T09:00:00Z',
    lastRun: '2025-09-02T09:00:00Z',
    isActive: true,
    recipients: ['diretoria@loja.com', 'rh@loja.com'],
    format: 'Excel',
    template: 'weekly_performance',
    status: 'active'
  },
  {
    id: '3',
    name: 'Relatório Mensal de RH',
    description: 'Métricas de funcionários, presença e produtividade',
    frequency: 'monthly',
    nextRun: '2025-10-01T10:00:00Z',
    lastRun: '2025-09-01T10:00:00Z',
    isActive: false,
    recipients: ['rh@loja.com', 'gerente@loja.com'],
    format: 'PDF',
    template: 'monthly_hr',
    status: 'paused'
  },
  {
    id: '4',
    name: 'Dashboard Executivo Trimestral',
    description: 'Visão executiva de todos os KPIs e métricas',
    frequency: 'quarterly',
    nextRun: '2025-12-01T07:00:00Z',
    lastRun: '2025-07-01T07:00:00Z',
    isActive: true,
    recipients: ['ceo@loja.com', 'diretoria@loja.com'],
    format: 'PDF',
    template: 'executive_dashboard',
    status: 'error'
  }
]

const frequencyLabels = {
  daily: 'Diário',
  weekly: 'Semanal', 
  monthly: 'Mensal',
  quarterly: 'Trimestral'
}

const statusConfig = {
  active: { 
    label: 'Ativo', 
    color: 'bg-green-500/10 text-green-600 border-green-500/20',
    icon: CheckCircle2 
  },
  paused: { 
    label: 'Pausado', 
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    icon: Pause 
  },
  error: { 
    label: 'Erro', 
    color: 'bg-red-500/10 text-red-600 border-red-500/20',
    icon: AlertCircle 
  }
}

export function ReportCenter({ 
  scheduledReports = mockScheduledReports,
  onToggleReport,
  onRunNow,
  onEditReport
}: ReportCenterProps) {
  const [isRunning, setIsRunning] = useState<string | null>(null)

  const handleToggleReport = (reportId: string, active: boolean) => {
    onToggleReport?.(reportId, active)
  }

  const handleRunNow = async (reportId: string) => {
    setIsRunning(reportId)
    try {
      await onRunNow?.(reportId)
    } catch (error) {
      console.error('Erro ao executar relatório:', error)
    } finally {
      setIsRunning(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {scheduledReports.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Agendados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {scheduledReports.filter(r => r.isActive).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ativos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {scheduledReports.filter(r => 
                    new Date(r.nextRun) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
                  ).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Próximas 24h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {scheduledReports.filter(r => r.status === 'error').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Com Erro
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Relatórios Agendados</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gerencie seus relatórios automáticos e agendamentos
            </p>
          </div>
          <Button className="gap-2">
            <Calendar className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduledReports.map((report) => {
              const statusInfo = statusConfig[report.status]
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 space-y-4"
                >
                  {/* Report Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {report.name}
                        </h3>
                        <Badge variant="outline" className={statusInfo.color}>
                          <statusInfo.icon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                        <Badge variant="secondary">
                          {frequencyLabels[report.frequency]}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {report.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={report.isActive}
                        onCheckedChange={(checked) => handleToggleReport(report.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditReport?.(report.id)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Report Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">
                        Próxima Execução
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(report.nextRun)}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">
                        Última Execução
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          {report.lastRun ? formatDate(report.lastRun) : 'Nunca executado'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">
                        Destinatários
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{report.recipients.length} destinatário(s)</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">
                        Formato
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span>{report.format}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>Template: {report.template}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRunNow(report.id)}
                        disabled={isRunning === report.id || !report.isActive}
                        className="gap-2"
                      >
                        {isRunning === report.id ? (
                          <>Executando...</>
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4" />
                            Executar Agora
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Último Relatório
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}