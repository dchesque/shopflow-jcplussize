'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface BehaviorPatternsChartProps {
  data?: Array<{
    behavior: string
    count: number
    percentage: number
  }>
}

export function BehaviorPatternsChart({ data = [] }: BehaviorPatternsChartProps) {
  const defaultData = [
    { behavior: 'Browsing', count: 245, percentage: 35 },
    { behavior: 'Purchasing', count: 156, percentage: 22 },
    { behavior: 'Comparing', count: 134, percentage: 19 },
    { behavior: 'Waiting', count: 89, percentage: 13 },
    { behavior: 'Consulting', count: 78, percentage: 11 },
  ]

  const chartData = data.length > 0 ? data : defaultData

  return (
    <Card>
      <CardHeader>
        <CardTitle>Behavior Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="behavior" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8b5cf6" name="Count" />
            <Bar dataKey="percentage" fill="#06b6d4" name="Percentage (%)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}