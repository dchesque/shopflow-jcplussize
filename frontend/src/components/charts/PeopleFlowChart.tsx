'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface PeopleFlowChartProps {
  data?: Array<{
    time: string
    entering: number
    exiting: number
    total: number
  }>
}

export function PeopleFlowChart({ data = [] }: PeopleFlowChartProps) {
  const defaultData = [
    { time: '08:00', entering: 45, exiting: 12, total: 33 },
    { time: '09:00', entering: 120, exiting: 30, total: 123 },
    { time: '10:00', entering: 89, exiting: 45, total: 167 },
    { time: '11:00', entering: 156, exiting: 78, total: 245 },
    { time: '12:00', entering: 234, exiting: 123, total: 356 },
    { time: '13:00', entering: 198, exiting: 156, total: 398 },
    { time: '14:00', entering: 167, exiting: 134, total: 431 },
    { time: '15:00', entering: 145, exiting: 167, total: 409 },
    { time: '16:00', entering: 123, exiting: 189, total: 343 },
    { time: '17:00', entering: 89, exiting: 234, total: 198 },
  ]

  const chartData = data.length > 0 ? data : defaultData

  return (
    <Card>
      <CardHeader>
        <CardTitle>People Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="entering"
              stroke="#10b981"
              name="Entering"
            />
            <Line
              type="monotone"
              dataKey="exiting"
              stroke="#ef4444"
              name="Exiting"
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#3b82f6"
              name="Total"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}