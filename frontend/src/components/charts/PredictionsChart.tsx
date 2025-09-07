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
  ReferenceLine,
} from 'recharts'

interface PredictionsChartProps {
  data?: Array<{
    time: string
    actual: number
    predicted: number
  }>
}

export function PredictionsChart({ data = [] }: PredictionsChartProps) {
  const defaultData = [
    { time: '08:00', actual: 45, predicted: 42 },
    { time: '09:00', actual: 120, predicted: 115 },
    { time: '10:00', actual: 89, predicted: 95 },
    { time: '11:00', actual: 156, predicted: 150 },
    { time: '12:00', actual: 234, predicted: 240 },
    { time: '13:00', actual: 198, predicted: 195 },
    { time: '14:00', actual: 167, predicted: 170 },
    { time: '15:00', actual: 145, predicted: 140 },
    { time: '16:00', actual: 123, predicted: 130 },
    { time: '17:00', actual: 89, predicted: 85 },
  ]

  const chartData = data.length > 0 ? data : defaultData

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Predictions</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <ReferenceLine y={150} stroke="#666" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#10b981"
              name="Actual"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#3b82f6"
              name="Predicted"
              strokeDasharray="5 5"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}