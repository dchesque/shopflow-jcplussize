'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  Activity, 
  Clock, 
  Calendar, 
  TrendingUp,
  Users,
  Eye
} from 'lucide-react'
import { EmployeeAnalytics } from '@/types/employee'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EmployeeAnalyticsChartProps {
  employeeId: string
  analytics?: EmployeeAnalytics
  isLoading: boolean
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function EmployeeAnalyticsChart({ employeeId, analytics, isLoading }: EmployeeAnalyticsChartProps) {
  
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Activity className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Dados de analytics não disponíveis</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for charts
  const dailyPresenceData = analytics.daily_presence?.map(day => ({
    date: format(new Date(day.date), 'dd/MM'),
    hours: day.total_hours,
    first: day.first_detection,
    last: day.last_detection
  })) || []

  const monthlyHoursData = analytics.monthly_hours?.map(month => ({
    month: month.month,
    hours: month.total_hours
  })) || []

  const departmentInteractionData = analytics.department_interactions?.map(dept => ({
    name: dept.department,
    value: dept.interaction_count
  })) || []

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Detecções</p>
                <p className="text-2xl font-bold">{analytics.total_detections}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dias Trabalhados</p>
                <p className="text-2xl font-bold">{analytics.daily_presence?.length || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Média Horas/Dia</p>
                <p className="text-2xl font-bold">
                  {analytics.daily_presence?.length ? 
                    (analytics.daily_presence.reduce((acc, day) => acc + day.total_hours, 0) / analytics.daily_presence.length).toFixed(1) :
                    0
                  }h
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Departamentos</p>
                <p className="text-2xl font-bold">{analytics.department_interactions?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Daily Presence Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Presença Diária
            </CardTitle>
            <CardDescription>
              Horas trabalhadas por dia nos últimos 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyPresenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => `Data: ${value}`}
                  formatter={(value) => [`${value}h`, 'Horas Trabalhadas']}
                />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Hours Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Horas Mensais
            </CardTitle>
            <CardDescription>
              Total de horas trabalhadas por mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyHoursData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}h`, 'Horas Totais']} />
                <Bar dataKey="hours" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Interactions */}
        {departmentInteractionData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Interações por Departamento
              </CardTitle>
              <CardDescription>
                Distribuição de presença por departamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentInteractionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentInteractionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
            <CardDescription>
              Últimas detecções e horários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.daily_presence?.slice(-5).reverse().map((day, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">
                      {format(new Date(day.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {day.first_detection} - {day.last_detection}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {day.total_hours.toFixed(1)}h
                  </Badge>
                </div>
              )) || (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma atividade recente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Card */}
      <Card>
        <CardHeader>
          <CardTitle>Insights e Padrões</CardTitle>
          <CardDescription>
            Análise comportamental baseada nos dados coletados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Pontualidade</h4>
              <p className="text-sm text-blue-700">
                {analytics.daily_presence?.length ? 
                  `Média de chegada às ${analytics.daily_presence[0]?.first_detection || 'N/A'}` :
                  'Dados insuficientes para análise'
                }
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Produtividade</h4>
              <p className="text-sm text-green-700">
                {analytics.total_detections > 100 ? 
                  'Alta presença detectada no ambiente de trabalho' :
                  'Presença moderada no ambiente de trabalho'
                }
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Mobilidade</h4>
              <p className="text-sm text-purple-700">
                {departmentInteractionData.length > 1 ?
                  `Transita entre ${departmentInteractionData.length} departamentos` :
                  'Permanece principalmente em um departamento'
                }
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">Consistência</h4>
              <p className="text-sm text-orange-700">
                {analytics.daily_presence?.length ? 
                  `Presente em ${analytics.daily_presence.length} dos últimos 30 dias` :
                  'Dados insuficientes para análise'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}