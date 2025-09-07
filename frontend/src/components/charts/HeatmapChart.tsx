'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useRef } from 'react'

interface HeatmapChartProps {
  data?: number[][]
  title?: string
}

export function HeatmapChart({ 
  data = [], 
  title = 'Activity Heatmap' 
}: HeatmapChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const defaultData = Array.from({ length: 10 }, () =>
    Array.from({ length: 10 }, () => Math.random() * 100)
  )

  const heatmapData = data.length > 0 ? data : defaultData

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cellWidth = canvas.width / heatmapData[0].length
    const cellHeight = canvas.height / heatmapData.length

    heatmapData.forEach((row, y) => {
      row.forEach((value, x) => {
        const intensity = value / 100
        const hue = (1 - intensity) * 240
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight)
      })
    })
  }, [heatmapData])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={500}
            height={300}
            className="w-full h-auto border rounded"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Low Activity</span>
            <span>High Activity</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}