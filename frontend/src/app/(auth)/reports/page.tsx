'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, Plus, Calendar, TrendingUp, Users, Download,
  BarChart3, PieChart, Activity, Target, Clock, Filter,
  Settings, Zap, Layers, BookOpen, Save, Share2
} from 'lucide-react'
import { ReportBuilder } from '@/components/employees/ReportBuilder'
import { ReportTemplates } from '@/components/employees/ReportTemplates'
import { ReportCenter } from '@/components/reports/ReportCenter'

interface QuickReport {
  id: string
  title: string
  description: string
  icon: any
  color: string
  category: string
  estimatedTime: string
  dataPoints: number
}

interface RecentReport {
  id: string
  title: string
  type: string
  createdAt: string
  downloadUrl: string
  size: string
  format: 'PDF' | 'Excel' | 'CSV'
}

const quickReports: QuickReport[] = [
  {
    id: 'daily_summary',
    title: 'Resumo Diário',
    description: 'Relatório completo das atividades do dia',
    icon: Calendar,
    color: 'blue',
    category: 'Operacional',
    estimatedTime: '2 min',
    dataPoints: 1200
  },
  {
    id: 'attendance_report',
    title: 'Relatório de Presença',
    description: 'Análise detalhada de presença dos funcionários',
    icon: Users,
    color: 'green',
    category: 'RH',
    estimatedTime: '3 min',
    dataPoints: 850
  },
  {
    id: 'performance_analytics',
    title: 'Analytics de Performance',
    description: 'Métricas de produtividade e eficiência',
    icon: TrendingUp,
    color: 'purple',
    category: 'Produtividade',
    estimatedTime: '4 min',
    dataPoints: 2100
  },
  {
    id: 'customer_flow',
    title: 'Fluxo de Clientes',
    description: 'Padrões de movimento e comportamento',
    icon: Activity,
    color: 'orange',
    category: 'Comportamento',
    estimatedTime: '5 min',
    dataPoints: 1800
  }
]

const recentReports: RecentReport[] = [
  {
    id: '1',
    title: 'Relatório Semanal - 02/09 a 08/09',
    type: 'Resumo Semanal',
    createdAt: '2025-09-08T10:30:00Z',
    downloadUrl: '/reports/weekly-2025-09-08.pdf',
    size: '2.4 MB',
    format: 'PDF'
  },
  {
    id: '2',
    title: 'Análise de Presença - Setembro',
    type: 'Presença',
    createdAt: '2025-09-07T14:15:00Z',
    downloadUrl: '/reports/attendance-september.xlsx',
    size: '1.8 MB',
    format: 'Excel'
  },
  {
    id: '3',
    title: 'Dashboard de Performance - Q3 2025',
    type: 'Performance',
    createdAt: '2025-09-06T09:45:00Z',
    downloadUrl: '/reports/performance-q3-2025.pdf',
    size: '3.2 MB',
    format: 'PDF'
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5 }
  }
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'builder' | 'templates' | 'automation' | 'history'>('overview')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  const handleQuickReport = async (reportId: string) => {
    setIsGenerating(true)
    setSelectedReport(reportId)
    
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Aqui seria feita a chamada para o backend
      console.log(`Gerando relatório: ${reportId}`)
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
    } finally {
      setIsGenerating(false)
      setSelectedReport(null)
    }
  }

  const handleDownloadReport = (report: RecentReport) => {
    // Aqui seria feito o download real
    console.log(`Fazendo download de: ${report.title}`)
  }

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      green: 'bg-green-500/10 text-green-500 border-green-500/20',
      purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      red: 'bg-red-500/10 text-red-500 border-red-500/20'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div 
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FileText className="h-8 w-8" />
              Central de Relatórios
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gere relatórios personalizados e acompanhe o desempenho da sua loja
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Relatório
            </Button>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-fit lg:grid-cols-5">
            <TabsTrigger value="overview" className="gap-2">
              <Layers className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="builder" className="gap-2">
              <Settings className="h-4 w-4" />
              Construtor
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="automation" className="gap-2">
              <Calendar className="h-4 w-4" />
              Automação
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Quick Reports */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Relatórios Rápidos
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Gere relatórios pré-configurados em poucos cliques
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {quickReports.map((report) => (
                        <motion.div
                          key={report.id}
                          variants={itemVariants}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${getColorClasses(report.color)}`}>
                                  <report.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {report.title}
                                  </h3>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {report.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {report.category}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {report.estimatedTime}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="w-full mt-3"
                                onClick={() => handleQuickReport(report.id)}
                                disabled={isGenerating}
                              >
                                {isGenerating && selectedReport === report.id ? (
                                  <>Gerando...</>
                                ) : (
                                  <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Gerar
                                  </>
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stats and Info */}
              <div className="space-y-6">
                {/* Stats Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estatísticas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Relatórios Gerados</span>
                      <span className="font-semibold">247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Este Mês</span>
                      <span className="font-semibold">38</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Templates Salvos</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Automações Ativas</span>
                      <span className="font-semibold">5</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Atividade Recente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentReports.slice(0, 3).map((report) => (
                        <div key={report.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {report.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {report.format}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="builder" className="space-y-6">
            <ReportBuilder
              availableMetrics={[]}
              onGenerateReport={async (config) => {
                console.log('Gerando relatório com config:', config)
              }}
            />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <ReportTemplates 
              onGenerateReport={async (template) => {
                console.log('Gerando relatório do template:', template)
              }}
            />
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <ReportCenter 
              onToggleReport={(id, active) => console.log('Toggle:', id, active)}
              onRunNow={async (id) => {
                console.log('Executando relatório:', id)
                await new Promise(resolve => setTimeout(resolve, 2000))
              }}
              onEditReport={(id) => console.log('Editando:', id)}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Histórico de Relatórios</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Acesse e faça download de relatórios gerados anteriormente
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtrar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentReports.map((report) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {report.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">
                              {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {report.type}
                            </Badge>
                            <span className="text-xs text-gray-400">{report.size}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {report.format}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadReport(report)}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Share2 className="h-4 w-4" />
                          Compartilhar
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}