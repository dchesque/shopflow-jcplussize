'use client'

import { useState } from 'react'
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ReferenceLine } from 'recharts'
import { Clock, TrendingUp, Calendar, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface HoursData {
  period: string
  date: Date
  regularHours: number
  overtimeHours: number
  expectedHours: number
  productivity?: number
  department?: string
}

interface Department {
  id: string
  name: string
  color: string
}

interface HoursWorkedChartProps {
  employeeId?: string
  employeeName?: string
  data: HoursData[]
  departments?: Department[]
  showDepartmentComparison?: boolean
  defaultPeriod?: 'week' | 'month'
}

const periodOptions = [
  { value: 'week', label: 'Semanal' },
  { value: 'month', label: 'Mensal' }
]

const OVERTIME_THRESHOLD = 44 // 44 horas semanais
const COLORS = {
  regular: '#3b82f6', // blue-500
  overtime: '#ef4444', // red-500
  expected: '#6b7280', // gray-500
  productivity: '#10b981' // green-500
}

export function HoursWorkedChart({
  employeeId,
  employeeName,
  data,
  departments = [],
  showDepartmentComparison = false,
  defaultPeriod = 'week'
}: HoursWorkedChartProps) {
  const [period, setPeriod] = useState<'week' | 'month'>(defaultPeriod)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')

  // Filter data by department if selected
  const filteredData = selectedDepartment === 'all' 
    ? data 
    : data.filter(item => item.department === selectedDepartment)

  // Calculate statistics
  const stats = filteredData.reduce((acc, item) => {
    acc.totalHours += item.regularHours + item.overtimeHours
    acc.totalRegular += item.regularHours
    acc.totalOvertime += item.overtimeHours
    acc.totalExpected += item.expectedHours
    if (item.productivity) {
      acc.productivitySum += item.productivity
      acc.productivityCount++
    }
    return acc
  }, {
    totalHours: 0,
    totalRegular: 0,
    totalOvertime: 0,
    totalExpected: 0,
    productivitySum: 0,
    productivityCount: 0
  })

  const avgProductivity = stats.productivityCount > 0 
    ? stats.productivitySum / stats.productivityCount 
    : 0

  const overtimePercentage = stats.totalHours > 0 
    ? (stats.totalOvertime / stats.totalHours) * 100 
    : 0

  // Prepare chart data
  const chartData = filteredData.map(item => ({
    ...item,
    totalHours: item.regularHours + item.overtimeHours,
    isOvertime: (item.regularHours + item.overtimeHours) > OVERTIME_THRESHOLD,
    efficiencyPercentage: item.expectedHours > 0 
      ? ((item.regularHours + item.overtimeHours) / item.expectedHours) * 100 
      : 100
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Período: ${label}`}</p>
          <p className="text-blue-500">
            {`Horas Regulares: ${data.regularHours}h`}
          </p>
          {data.overtimeHours > 0 && (
            <p className="text-red-500">
              {`Horas Extra: ${data.overtimeHours}h`}
            </p>
          )}
          <p className="text-gray-500">
            {`Esperado: ${data.expectedHours}h`}
          </p>
          <p className="font-medium">
            {`Total: ${data.totalHours}h`}
          </p>
          {data.productivity && (
            <p className="text-green-500">
              {`Produtividade: ${data.productivity}%`}
            </p>
          )}
          {data.isOvertime && (
            <Badge variant="destructive" className="mt-2">
              Hora Extra
            </Badge>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Horas Trabalhadas
          </h2>
          {employeeName && (
            <p className="text-gray-600 dark:text-gray-400">{employeeName}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={period} onValueChange={(value: 'week' | 'month') => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showDepartmentComparison && departments.length > 0 && (
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Departamentos</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              variant={chartType === 'bar' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              Barras
            </Button>
            <Button
              variant={chartType === 'line' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              Linha
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total de Horas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalHours}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Horas Extra
                </p>
                <p className="text-2xl font-bold text-red-500">
                  {stats.totalOvertime}h
                </p>
                <p className="text-sm text-gray-500">
                  {overtimePercentage.toFixed(1)}% do total
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Produtividade
                </p>
                <p className="text-2xl font-bold text-green-500">
                  {avgProductivity.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500">
                  Média do período
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Eficiência
                </p>
                <p className="text-2xl font-bold text-purple-500">
                  {stats.totalExpected > 0 ? 
                    ((stats.totalHours / stats.totalExpected) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-sm text-gray-500">
                  Horas vs Esperado
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Distribuição de Horas - {period === 'week' ? 'Semanal' : 'Mensal'}</span>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span>Regular</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span>Extra</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded" />
                <span>Esperado</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="period" 
                    className="text-sm"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    className="text-sm"
                    label={{ value: 'Horas', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  
                  {/* Reference line for overtime threshold */}
                  <ReferenceLine 
                    y={OVERTIME_THRESHOLD} 
                    stroke="#ef4444" 
                    strokeDasharray="5 5"
                    label="Limite Hora Extra"
                  />
                  
                  <Bar
                    dataKey="regularHours"
                    name="Horas Regulares"
                    fill={COLORS.regular}
                    radius={[0, 0, 4, 4]}
                  />
                  <Bar
                    dataKey="overtimeHours"
                    name="Horas Extra"
                    fill={COLORS.overtime}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="expectedHours"
                    name="Horas Esperadas"
                    fill={COLORS.expected}
                    fillOpacity={0.3}
                    radius={[2, 2, 2, 2]}
                  />
                </BarChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="period" 
                    className="text-sm"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    className="text-sm"
                    label={{ value: 'Horas', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  
                  <ReferenceLine 
                    y={OVERTIME_THRESHOLD} 
                    stroke="#ef4444" 
                    strokeDasharray="5 5"
                    label="Limite Hora Extra"
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="totalHours"
                    name="Total de Horas"
                    stroke={COLORS.regular}
                    strokeWidth={3}
                    dot={{ fill: COLORS.regular, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expectedHours"
                    name="Horas Esperadas"
                    stroke={COLORS.expected}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: COLORS.expected, r: 3 }}
                  />
                  {filteredData.some(item => item.productivity) && (
                    <Line
                      type="monotone"
                      dataKey="productivity"
                      name="Produtividade (%)"
                      stroke={COLORS.productivity}
                      strokeWidth={2}
                      dot={{ fill: COLORS.productivity, r: 3 }}
                      yAxisId="productivity"
                    />
                  )}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Department Comparison */}
      {showDepartmentComparison && departments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparação por Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departments.map(dept => {
                const deptData = data.filter(item => item.department === dept.id)
                const deptStats = deptData.reduce((acc, item) => {
                  acc.total += item.regularHours + item.overtimeHours
                  acc.overtime += item.overtimeHours
                  return acc
                }, { total: 0, overtime: 0 })

                const overtimeRate = deptStats.total > 0 ? (deptStats.overtime / deptStats.total) * 100 : 0

                return (
                  <div key={dept.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: dept.color }}
                      />
                      <div>
                        <h3 className="font-medium">{dept.name}</h3>
                        <p className="text-sm text-gray-500">
                          {deptStats.total}h total • {deptStats.overtime}h extra
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {overtimeRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500">
                        Taxa de Hora Extra
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}