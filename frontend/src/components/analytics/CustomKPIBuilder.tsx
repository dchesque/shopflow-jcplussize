'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { 
  Plus, Calculator, Target, TrendingUp, AlertTriangle, 
  CheckCircle2, Edit3, Trash2, Copy, Save, PlayCircle,
  BarChart3, PieChart, LineChart as LineChartIcon, Activity, Zap,
  Users, ShoppingBag, DollarSign, Clock, Eye, Star
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface FormulaVariable {
  key: string
  label: string
  description: string
  dataType: 'number' | 'percentage' | 'currency' | 'time'
  category: 'traffic' | 'sales' | 'customer' | 'operational'
  icon: any
  sampleValue: number
}

interface KPIThreshold {
  type: 'target' | 'warning' | 'critical'
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
  value: number
  color: string
  label: string
  action?: string
}

interface CustomKPI {
  id: string
  name: string
  description: string
  formula: string
  category: string
  unit: string
  thresholds: KPIThreshold[]
  isActive: boolean
  chartType: 'line' | 'bar' | 'area' | 'gauge'
  aggregationType: 'sum' | 'avg' | 'count' | 'max' | 'min'
  timeframe: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly'
  createdAt: string
  lastCalculated: string
  currentValue: number
  trend: number
  historicalData: Array<{
    timestamp: string
    value: number
    date: string
  }>
}

interface CustomKPIBuilderProps {
  className?: string
  onKPISave?: (kpi: CustomKPI) => void
  existingKPIs?: CustomKPI[]
}

export function CustomKPIBuilder({ 
  className = '', 
  onKPISave,
  existingKPIs = []
}: CustomKPIBuilderProps) {
  const [activeTab, setActiveTab] = useState<'builder' | 'manage' | 'templates'>('builder')
  const [selectedKPI, setSelectedKPI] = useState<CustomKPI | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Form states
  const [formData, setFormData] = useState<{
    name: string
    description: string
    formula: string
    category: string
    unit: string
    chartType: 'line' | 'bar' | 'area' | 'gauge'
    aggregationType: 'sum' | 'avg' | 'count' | 'max' | 'min'
    timeframe: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly'
    isActive: boolean
  }>({
    name: '',
    description: '',
    formula: '',
    category: 'sales',
    unit: 'number',
    chartType: 'line',
    aggregationType: 'avg',
    timeframe: 'daily',
    isActive: true
  })

  const [thresholds, setThresholds] = useState<KPIThreshold[]>([])
  const [formulaError, setFormulaError] = useState('')

  const availableVariables: FormulaVariable[] = [
    { key: 'total_visitors', label: 'Total de Visitantes', description: 'Número total de pessoas que entraram na loja', dataType: 'number', category: 'traffic', icon: Users, sampleValue: 450 },
    { key: 'total_customers', label: 'Total de Clientes', description: 'Número total de pessoas que fizeram compras', dataType: 'number', category: 'sales', icon: ShoppingBag, sampleValue: 120 },
    { key: 'total_revenue', label: 'Receita Total', description: 'Valor total em vendas', dataType: 'currency', category: 'sales', icon: DollarSign, sampleValue: 25400 },
    { key: 'avg_time_spent', label: 'Tempo Médio na Loja', description: 'Tempo médio de permanência dos visitantes', dataType: 'time', category: 'customer', icon: Clock, sampleValue: 28.5 },
    { key: 'conversion_rate', label: 'Taxa de Conversão', description: 'Percentual de visitantes que compraram', dataType: 'percentage', category: 'sales', icon: Target, sampleValue: 26.7 },
    { key: 'avg_ticket_value', label: 'Ticket Médio', description: 'Valor médio por transação', dataType: 'currency', category: 'sales', icon: Calculator, sampleValue: 185.4 },
    { key: 'peak_hour_traffic', label: 'Tráfego na Hora de Pico', description: 'Número de visitantes na hora mais movimentada', dataType: 'number', category: 'traffic', icon: TrendingUp, sampleValue: 85 },
    { key: 'customer_satisfaction', label: 'Satisfação do Cliente', description: 'Índice de satisfação (0-100)', dataType: 'percentage', category: 'customer', icon: Star, sampleValue: 87.2 },
    { key: 'return_visits', label: 'Visitas de Retorno', description: 'Número de clientes que retornaram', dataType: 'number', category: 'customer', icon: Eye, sampleValue: 45 },
    { key: 'staff_count', label: 'Funcionários Ativos', description: 'Número de funcionários trabalhando', dataType: 'number', category: 'operational', icon: Users, sampleValue: 8 }
  ]

  const kpiTemplates: Partial<CustomKPI>[] = [
    {
      name: 'Eficiência de Conversão',
      description: 'Mede a eficiência da conversão ajustada pelo tempo de permanência',
      formula: '(total_customers / total_visitors) * (avg_time_spent / 30)',
      category: 'sales',
      unit: 'ratio',
      chartType: 'area'
    },
    {
      name: 'Receita por Visitante',
      description: 'Receita média gerada por cada visitante da loja',
      formula: 'total_revenue / total_visitors',
      category: 'sales',
      unit: 'currency',
      chartType: 'line'
    },
    {
      name: 'Produtividade da Equipe',
      description: 'Vendas por funcionário ativo na loja',
      formula: 'total_revenue / staff_count',
      category: 'operational',
      unit: 'currency',
      chartType: 'bar'
    },
    {
      name: 'Índice de Engajamento',
      description: 'Combina tempo de permanência com satisfação do cliente',
      formula: '(avg_time_spent / 60) * (customer_satisfaction / 100)',
      category: 'customer',
      unit: 'score',
      chartType: 'gauge'
    },
    {
      name: 'Velocidade de Pico',
      description: 'Eficiência de vendas durante horário de pico',
      formula: '(peak_hour_traffic * conversion_rate / 100) / staff_count',
      category: 'operational',
      unit: 'ratio',
      chartType: 'line'
    }
  ]

  // Mock existing KPIs
  const [customKPIs, setCustomKPIs] = useState<CustomKPI[]>([
    {
      id: 'kpi_1',
      name: 'ROI por Metro Quadrado',
      description: 'Retorno sobre investimento por área da loja',
      formula: 'total_revenue / 150', // Assuming 150 sqm
      category: 'operational',
      unit: 'currency',
      thresholds: [
        { type: 'target', operator: 'gte', value: 200, color: '#10b981', label: 'Meta Ideal' },
        { type: 'warning', operator: 'lt', value: 150, color: '#f59e0b', label: 'Atenção' },
        { type: 'critical', operator: 'lt', value: 100, color: '#ef4444', label: 'Crítico' }
      ],
      isActive: true,
      chartType: 'area',
      aggregationType: 'avg',
      timeframe: 'daily',
      createdAt: '2025-09-07',
      lastCalculated: new Date().toISOString(),
      currentValue: 169.33,
      trend: 5.2,
      historicalData: Array.from({ length: 30 }, (_, i) => ({
        timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
        value: 140 + Math.sin(i * 0.2) * 20,
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
      }))
    },
    {
      id: 'kpi_2',
      name: 'Eficiência Temporal',
      description: 'Receita gerada por minuto de funcionamento',
      formula: 'total_revenue / (12 * 60)', // Assuming 12h operation
      category: 'operational',
      unit: 'currency',
      thresholds: [
        { type: 'target', operator: 'gte', value: 40, color: '#10b981', label: 'Excelente' },
        { type: 'warning', operator: 'lt', value: 25, color: '#f59e0b', label: 'Precisa Melhorar' }
      ],
      isActive: true,
      chartType: 'line',
      aggregationType: 'sum',
      timeframe: 'hourly',
      createdAt: '2025-09-05',
      lastCalculated: new Date().toISOString(),
      currentValue: 35.28,
      trend: -2.1,
      historicalData: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
        value: 20 + Math.sin(i * 0.5) * 15,
        date: `${i.toString().padStart(2, '0')}:00`
      }))
    }
  ])

  const validateFormula = (formula: string): boolean => {
    try {
      // Basic validation - check if all variables exist and basic syntax
      const variableKeys = availableVariables.map(v => v.key)
      const formulaVariables = formula.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || []
      
      const unknownVars = formulaVariables.filter(v => 
        !variableKeys.includes(v) && 
        !['sum', 'avg', 'max', 'min', 'count'].includes(v)
      )
      
      if (unknownVars.length > 0) {
        setFormulaError(`Variáveis desconhecidas: ${unknownVars.join(', ')}`)
        return false
      }

      // Check for basic mathematical operators
      const validFormula = /^[a-zA-Z0-9_+\-*/().\s]+$/.test(formula)
      if (!validFormula) {
        setFormulaError('Fórmula contém caracteres inválidos')
        return false
      }

      setFormulaError('')
      return true
    } catch (error) {
      setFormulaError('Erro na validação da fórmula')
      return false
    }
  }

  const calculateKPIValue = (formula: string): number => {
    try {
      // Replace variables with sample values for preview
      let calculatedFormula = formula
      availableVariables.forEach(variable => {
        const regex = new RegExp(`\\b${variable.key}\\b`, 'g')
        calculatedFormula = calculatedFormula.replace(regex, variable.sampleValue.toString())
      })
      
      // Basic evaluation (in real app, use a safe expression evaluator)
      const result = eval(calculatedFormula)
      return typeof result === 'number' && !isNaN(result) ? result : 0
    } catch (error) {
      return 0
    }
  }

  const handleSaveKPI = () => {
    if (!formData.name || !formData.formula) {
      alert('Nome e fórmula são obrigatórios')
      return
    }

    if (!validateFormula(formData.formula)) {
      return
    }

    const newKPI: CustomKPI = {
      id: isEditing ? selectedKPI!.id : `kpi_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      formula: formData.formula,
      category: formData.category,
      unit: formData.unit,
      thresholds,
      isActive: formData.isActive,
      chartType: formData.chartType,
      aggregationType: formData.aggregationType,
      timeframe: formData.timeframe,
      createdAt: isEditing ? selectedKPI!.createdAt : new Date().toISOString().split('T')[0],
      lastCalculated: new Date().toISOString(),
      currentValue: calculateKPIValue(formData.formula),
      trend: 0, // Real trend should come from backend calculation
      historicalData: Array.from({ length: 30 }, (_, i) => ({
        timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
        value: calculateKPIValue(formData.formula),
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
      }))
    }

    if (isEditing) {
      setCustomKPIs(prev => prev.map(kpi => kpi.id === newKPI.id ? newKPI : kpi))
    } else {
      setCustomKPIs(prev => [...prev, newKPI])
    }

    onKPISave?.(newKPI)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      formula: '',
      category: 'sales',
      unit: 'number',
      chartType: 'line',
      aggregationType: 'avg',
      timeframe: 'daily',
      isActive: true
    })
    setThresholds([])
    setSelectedKPI(null)
    setIsEditing(false)
    setFormulaError('')
  }

  const addThreshold = () => {
    const newThreshold: KPIThreshold = {
      type: 'target',
      operator: 'gte',
      value: 0,
      color: '#10b981',
      label: 'Nova Meta'
    }
    setThresholds(prev => [...prev, newThreshold])
  }

  const updateThreshold = (index: number, field: keyof KPIThreshold, value: any) => {
    setThresholds(prev => prev.map((threshold, i) => 
      i === index ? { ...threshold, [field]: value } : threshold
    ))
  }

  const removeThreshold = (index: number) => {
    setThresholds(prev => prev.filter((_, i) => i !== index))
  }

  const loadTemplate = (template: Partial<CustomKPI>) => {
    setFormData({
      name: template.name || '',
      description: template.description || '',
      formula: template.formula || '',
      category: template.category || 'sales',
      unit: template.unit || 'number',
      chartType: template.chartType || 'line',
      aggregationType: 'avg',
      timeframe: 'daily',
      isActive: true
    })
    setActiveTab('builder')
  }

  const editKPI = (kpi: CustomKPI) => {
    setFormData({
      name: kpi.name,
      description: kpi.description,
      formula: kpi.formula,
      category: kpi.category,
      unit: kpi.unit,
      chartType: kpi.chartType,
      aggregationType: kpi.aggregationType,
      timeframe: kpi.timeframe,
      isActive: kpi.isActive
    })
    setThresholds(kpi.thresholds)
    setSelectedKPI(kpi)
    setIsEditing(true)
    setActiveTab('builder')
  }

  const deleteKPI = (id: string) => {
    setCustomKPIs(prev => prev.filter(kpi => kpi.id !== id))
  }

  const toggleKPIStatus = (id: string) => {
    setCustomKPIs(prev => prev.map(kpi => 
      kpi.id === id ? { ...kpi, isActive: !kpi.isActive } : kpi
    ))
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Constructor de KPIs Customizados</h3>
            <p className="text-sm text-muted-foreground">
              Crie métricas personalizadas com fórmulas avançadas e limites configuráveis
            </p>
          </div>
          
          <Button onClick={resetForm} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Novo KPI
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="builder" className="gap-2">
              <Calculator className="w-4 h-4" />
              Constructor
            </TabsTrigger>
            <TabsTrigger value="manage" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Gerenciar ({customKPIs.length})
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Copy className="w-4 h-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Builder Tab */}
          <TabsContent value="builder" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do KPI</Label>
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: ROI por Área"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Vendas</SelectItem>
                        <SelectItem value="customer">Cliente</SelectItem>
                        <SelectItem value="operational">Operacional</SelectItem>
                        <SelectItem value="traffic">Tráfego</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea 
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o que este KPI mede e sua importância"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fórmula</Label>
                  <Textarea 
                    value={formData.formula}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, formula: e.target.value }))
                      if (e.target.value) validateFormula(e.target.value)
                    }}
                    placeholder="Ex: total_revenue / total_visitors"
                    rows={3}
                    className={formulaError ? 'border-red-500' : ''}
                  />
                  {formulaError && (
                    <p className="text-sm text-red-500">{formulaError}</p>
                  )}
                  {formData.formula && !formulaError && (
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Valor calculado (preview): <strong>{calculateKPIValue(formData.formula).toFixed(2)}</strong>
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="number">Número</SelectItem>
                        <SelectItem value="currency">Moeda (R$)</SelectItem>
                        <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                        <SelectItem value="ratio">Razão</SelectItem>
                        <SelectItem value="score">Score</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de Gráfico</Label>
                    <Select value={formData.chartType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, chartType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">Linha</SelectItem>
                        <SelectItem value="area">Área</SelectItem>
                        <SelectItem value="bar">Barra</SelectItem>
                        <SelectItem value="gauge">Medidor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Período</Label>
                    <Select value={formData.timeframe} onValueChange={(value: any) => setFormData(prev => ({ ...prev, timeframe: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Tempo Real</SelectItem>
                        <SelectItem value="hourly">Por Hora</SelectItem>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Thresholds */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Limites e Metas</Label>
                    <Button onClick={addThreshold} variant="outline" size="sm" className="gap-2">
                      <Plus className="w-3 h-3" />
                      Adicionar Limite
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {thresholds.map((threshold, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Select 
                          value={threshold.type} 
                          onValueChange={(value: any) => updateThreshold(index, 'type', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="target">Meta</SelectItem>
                            <SelectItem value="warning">Aviso</SelectItem>
                            <SelectItem value="critical">Crítico</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select 
                          value={threshold.operator} 
                          onValueChange={(value: any) => updateThreshold(index, 'operator', value)}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gt">&gt;</SelectItem>
                            <SelectItem value="gte">≥</SelectItem>
                            <SelectItem value="lt">&lt;</SelectItem>
                            <SelectItem value="lte">≤</SelectItem>
                            <SelectItem value="eq">=</SelectItem>
                          </SelectContent>
                        </Select>

                        <Input
                          type="number"
                          value={threshold.value}
                          onChange={(e) => updateThreshold(index, 'value', parseFloat(e.target.value))}
                          className="w-24"
                        />

                        <Input
                          value={threshold.label}
                          onChange={(e) => updateThreshold(index, 'label', e.target.value)}
                          placeholder="Rótulo"
                          className="flex-1"
                        />

                        <Button 
                          onClick={() => removeThreshold(index)} 
                          variant="outline" 
                          size="sm"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label>KPI ativo</Label>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={resetForm} variant="outline">
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveKPI} className="gap-2">
                      <Save className="w-4 h-4" />
                      {isEditing ? 'Atualizar' : 'Salvar'} KPI
                    </Button>
                  </div>
                </div>
              </div>

              {/* Variables Panel */}
              <div className="space-y-4">
                <h4 className="font-medium">Variáveis Disponíveis</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableVariables.map((variable) => {
                    const Icon = variable.icon
                    return (
                      <div 
                        key={variable.key}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          const newFormula = formData.formula + (formData.formula ? ' + ' : '') + variable.key
                          setFormData(prev => ({ ...prev, formula: newFormula }))
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="w-4 h-4 mt-0.5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{variable.label}</p>
                            <p className="text-xs text-muted-foreground">{variable.description}</p>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {variable.key}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {customKPIs.map((kpi) => (
                <Card key={kpi.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{kpi.name}</h4>
                          <Badge variant={kpi.isActive ? 'default' : 'secondary'}>
                            {kpi.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{kpi.description}</p>
                        <p className="text-xs text-muted-foreground mt-2 font-mono">{kpi.formula}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button onClick={() => editKPI(kpi)} variant="outline" size="sm">
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button onClick={() => deleteKPI(kpi.id)} variant="outline" size="sm">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{kpi.currentValue.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Valor Atual</p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {kpi.trend > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                        )}
                        <span className={`text-sm ${kpi.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {kpi.trend > 0 ? '+' : ''}{kpi.trend.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        {kpi.chartType === 'area' ? (
                          <AreaChart data={kpi.historicalData.slice(-7)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#3b82f6" 
                              fill="#3b82f6" 
                              fillOpacity={0.3}
                            />
                          </AreaChart>
                        ) : (
                          <LineChart data={kpi.historicalData.slice(-7)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#3b82f6" 
                              strokeWidth={2}
                            />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={kpi.isActive}
                        onCheckedChange={() => toggleKPIStatus(kpi.id)}
                      />
                      <span className="text-sm">Ativo no dashboard</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kpiTemplates.map((template, index) => (
                <Card key={index} className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
                      onClick={() => loadTemplate(template)}>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    
                    <div className="p-2 bg-muted/50 rounded font-mono text-sm">
                      {template.formula}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{template.category}</Badge>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <PlayCircle className="w-4 h-4" />
                        <span className="text-sm">Usar Template</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  )
}