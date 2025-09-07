'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Users, TrendingUp, TrendingDown, Clock, ShoppingBag, Heart } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

interface GroupDetection {
  id: string
  size: number
  type: 'family' | 'friends' | 'couple' | 'colleagues' | 'individual'
  confidence: number
  avgAge: number
  timeSpent: number
  conversion: boolean
  purchaseValue?: number
  locations: string[]
  timestamp: Date
}

interface GroupTrend {
  date: string
  family: number
  friends: number
  couple: number
  colleagues: number
  individual: number
}

interface GroupAnalysisProps {
  className?: string
  timeRange?: '1d' | '7d' | '30d'
  onTimeRangeChange?: (range: '1d' | '7d' | '30d') => void
}

export function GroupAnalysis({ 
  className = '', 
  timeRange = '1d',
  onTimeRangeChange 
}: GroupAnalysisProps) {
  const [selectedGroupType, setSelectedGroupType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'time' | 'size' | 'conversion'>('time')
  
  const generateMockGroups = (): GroupDetection[] => {
    const types: GroupDetection['type'][] = ['family', 'friends', 'couple', 'colleagues', 'individual']
    const locations = ['entrada', 'eletrônicos', 'roupas', 'alimentação', 'checkout']
    
    return Array.from({ length: 25 }, (_, i) => ({
      id: `group_${i}`,
      size: Math.floor(Math.random() * 5) + 1,
      type: types[Math.floor(Math.random() * types.length)],
      confidence: Math.random() * 0.3 + 0.7,
      avgAge: Math.floor(Math.random() * 40) + 20,
      timeSpent: Math.floor(Math.random() * 120) + 30,
      conversion: Math.random() > 0.4,
      purchaseValue: Math.random() > 0.4 ? Math.floor(Math.random() * 500) + 50 : undefined,
      locations: Array.from({ length: Math.floor(Math.random() * 4) + 2 }, 
        () => locations[Math.floor(Math.random() * locations.length)]
      ),
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
    }))
  }
  
  const generateGroupTrends = (): GroupTrend[] => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    return days.map(day => ({
      date: day,
      family: Math.floor(Math.random() * 50) + 20,
      friends: Math.floor(Math.random() * 40) + 15,
      couple: Math.floor(Math.random() * 60) + 25,
      colleagues: Math.floor(Math.random() * 30) + 10,
      individual: Math.floor(Math.random() * 80) + 40
    }))
  }
  
  const [groups] = useState(generateMockGroups())
  const [groupTrends] = useState(generateGroupTrends())
  
  const groupTypeColors = {
    family: '#10b981',
    friends: '#3b82f6',
    couple: '#ef4444',
    colleagues: '#f59e0b',
    individual: '#8b5cf6'
  }
  
  const groupTypeLabels = {
    family: 'Família',
    friends: 'Amigos',
    couple: 'Casal',
    colleagues: 'Colegas',
    individual: 'Individual'
  }
  
  const groupTypeIcons = {
    family: Users,
    friends: Users,
    couple: Heart,
    colleagues: Users,
    individual: Users
  }
  
  const filteredGroups = selectedGroupType === 'all' 
    ? groups 
    : groups.filter(g => g.type === selectedGroupType)
  
  const sortedGroups = [...filteredGroups].sort((a, b) => {
    switch (sortBy) {
      case 'time':
        return b.timeSpent - a.timeSpent
      case 'size':
        return b.size - a.size
      case 'conversion':
        return (b.conversion ? 1 : 0) - (a.conversion ? 1 : 0)
      default:
        return 0
    }
  })
  
  const groupSummary = Object.entries(groupTypeLabels).map(([type, label]) => {
    const typeGroups = groups.filter(g => g.type === type)
    const avgSize = typeGroups.reduce((sum, g) => sum + g.size, 0) / typeGroups.length || 0
    const conversionRate = typeGroups.filter(g => g.conversion).length / typeGroups.length || 0
    const avgTimeSpent = typeGroups.reduce((sum, g) => sum + g.timeSpent, 0) / typeGroups.length || 0
    const avgPurchase = typeGroups
      .filter(g => g.purchaseValue)
      .reduce((sum, g) => sum + (g.purchaseValue || 0), 0) / typeGroups.filter(g => g.purchaseValue).length || 0
    
    return {
      type,
      label,
      count: typeGroups.length,
      avgSize: Math.round(avgSize * 10) / 10,
      conversionRate: Math.round(conversionRate * 100),
      avgTimeSpent: Math.round(avgTimeSpent),
      avgPurchase: Math.round(avgPurchase),
      color: groupTypeColors[type as keyof typeof groupTypeColors]
    }
  })
  
  const pieChartData = groupSummary.map(item => ({
    name: item.label,
    value: item.count,
    color: item.color
  }))

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Análise de Grupos</h3>
            <p className="text-sm text-muted-foreground">
              Classificação automática e padrões de comportamento em grupo
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedGroupType} onValueChange={setSelectedGroupType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="family">Família</SelectItem>
                <SelectItem value="friends">Amigos</SelectItem>
                <SelectItem value="couple">Casal</SelectItem>
                <SelectItem value="colleagues">Colegas</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={timeRange} onValueChange={(value: any) => onTimeRangeChange?.(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Hoje</SelectItem>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Grupos Detectados</p>
                <p className="text-2xl font-bold text-green-700">{groups.length}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 text-sm">+12% vs ontem</span>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Tamanho Médio</p>
                <p className="text-2xl font-bold text-blue-700">
                  {Math.round((groups.reduce((sum, g) => sum + g.size, 0) / groups.length) * 10) / 10}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-blue-600 text-sm">+5% vs semana</span>
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Taxa Conversão</p>
                <p className="text-2xl font-bold text-purple-700">
                  {Math.round((groups.filter(g => g.conversion).length / groups.length) * 100)}%
                </p>
              </div>
              <ShoppingBag className="w-8 h-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-600 text-sm">-3% vs média</span>
            </div>
          </div>
          
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Tempo Médio</p>
                <p className="text-2xl font-bold text-orange-700">
                  {Math.round(groups.reduce((sum, g) => sum + g.timeSpent, 0) / groups.length)}min
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-orange-500 mr-1" />
              <span className="text-orange-600 text-sm">+8% vs média</span>
            </div>
          </div>
        </div>
        
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Group Distribution */}
          <div className="space-y-4">
            <h4 className="font-medium">Distribuição por Tipo</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Weekly Trends */}
          <div className="space-y-4">
            <h4 className="font-medium">Tendências Semanais</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={groupTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="family" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="friends" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="couple" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="colleagues" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="individual" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Group Type Analysis */}
        <div className="space-y-4">
          <h4 className="font-medium">Análise Detalhada por Tipo</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {groupSummary.map((summary) => {
              const Icon = groupTypeIcons[summary.type as keyof typeof groupTypeIcons]
              return (
                <motion.div
                  key={summary.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg bg-background"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="w-5 h-5" style={{ color: summary.color }} />
                    <h5 className="font-medium">{summary.label}</h5>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Grupos:</span>
                      <span className="font-medium">{summary.count}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tamanho Médio:</span>
                      <span className="font-medium">{summary.avgSize}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Conversão:</span>
                      <span className="font-medium">{summary.conversionRate}%</span>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Performance:</span>
                        <span className="font-medium">{summary.conversionRate}%</span>
                      </div>
                      <Progress 
                        value={summary.conversionRate} 
                        className="h-2"
                        style={{ 
                          backgroundColor: `${summary.color}20`,
                        }}
                      />
                    </div>
                    
                    {summary.avgPurchase > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ticket Médio:</span>
                        <span className="font-medium">R$ {summary.avgPurchase}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
        
        {/* Recent Group Detections */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Detecções Recentes</h4>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">Por Tempo</SelectItem>
                <SelectItem value="size">Por Tamanho</SelectItem>
                <SelectItem value="conversion">Por Conversão</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {sortedGroups.slice(0, 9).map((group) => {
              const Icon = groupTypeIcons[group.type]
              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 border rounded-lg bg-background hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon 
                        className="w-4 h-4" 
                        style={{ color: groupTypeColors[group.type] }} 
                      />
                      <span className="font-medium text-sm">
                        {groupTypeLabels[group.type]}
                      </span>
                    </div>
                    <Badge variant={group.conversion ? 'default' : 'secondary'}>
                      {group.conversion ? 'Converteu' : 'Navegou'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span>Tamanho: </span>
                      <span className="font-medium">{group.size} pessoas</span>
                    </div>
                    <div>
                      <span>Confiança: </span>
                      <span className="font-medium">{Math.round(group.confidence * 100)}%</span>
                    </div>
                    <div>
                      <span>Tempo: </span>
                      <span className="font-medium">{group.timeSpent}min</span>
                    </div>
                    <div>
                      <span>Idade Média: </span>
                      <span className="font-medium">{group.avgAge} anos</span>
                    </div>
                  </div>
                  
                  {group.purchaseValue && (
                    <div className="mt-2 text-xs">
                      <span className="text-muted-foreground">Valor da Compra: </span>
                      <span className="font-medium text-green-600">R$ {group.purchaseValue}</span>
                    </div>
                  )}
                  
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground mb-1">Zonas Visitadas:</div>
                    <div className="flex flex-wrap gap-1">
                      {group.locations.slice(0, 3).map((location, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {location}
                        </Badge>
                      ))}
                      {group.locations.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{group.locations.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}