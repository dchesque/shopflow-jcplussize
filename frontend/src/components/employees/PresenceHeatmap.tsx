'use client'

import { useState, useMemo } from 'react'
import { format, addDays, startOfWeek, endOfWeek, eachHourOfInterval, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MapPin, Clock, AlertTriangle, TrendingUp, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PresencePoint {
  employeeId: string
  employeeName?: string
  timestamp: Date
  zone: string
  duration: number // em minutos
  activity: 'work' | 'break' | 'meeting' | 'idle'
  department?: string
}

interface Zone {
  id: string
  name: string
  type: 'work' | 'break' | 'meeting' | 'common'
  color: string
}

interface PresenceHeatmapProps {
  data: PresencePoint[]
  zones: Zone[]
  employeeId?: string
  employeeName?: string
  dateRange?: { start: Date; end: Date }
}

const activityColors = {
  work: 'bg-blue-500',
  break: 'bg-green-500',
  meeting: 'bg-purple-500',
  idle: 'bg-gray-400'
}

const activityLabels = {
  work: 'Trabalhando',
  break: 'Pausa',
  meeting: 'Reunião',
  idle: 'Inativo'
}

const hours = Array.from({ length: 24 }, (_, i) => i)
const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function PresenceHeatmap({
  data,
  zones,
  employeeId,
  employeeName,
  dateRange
}: PresenceHeatmapProps) {
  const [viewMode, setViewMode] = useState<'hourly' | 'zones' | 'patterns'>('hourly')
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [selectedActivity, setSelectedActivity] = useState<string>('all')

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(point => {
      if (selectedZone !== 'all' && point.zone !== selectedZone) return false
      if (selectedActivity !== 'all' && point.activity !== selectedActivity) return false
      if (employeeId && point.employeeId !== employeeId) return false
      return true
    })
  }, [data, selectedZone, selectedActivity, employeeId])

  // Generate heatmap data by hour
  const hourlyHeatmap = useMemo(() => {
    const heatmapData: Array<Array<{ hour: number, day: number, intensity: number, activities: string[] }>> = []
    
    for (let day = 0; day < 7; day++) {
      heatmapData[day] = []
      for (let hour = 0; hour < 24; hour++) {
        const dayData = filteredData.filter(point => {
          const pointDay = point.timestamp.getDay()
          const pointHour = point.timestamp.getHours()
          return pointDay === day && pointHour === hour
        })

        const intensity = Math.min(dayData.length * 10, 100) // Normalize to 0-100
        const activities = [...new Set(dayData.map(p => p.activity))]

        heatmapData[day][hour] = {
          hour,
          day,
          intensity,
          activities
        }
      }
    }

    return heatmapData
  }, [filteredData])

  // Generate zone activity data
  const zoneActivity = useMemo(() => {
    const zoneData = zones.map(zone => {
      const zonePoints = filteredData.filter(p => p.zone === zone.id)
      const totalDuration = zonePoints.reduce((sum, p) => sum + p.duration, 0)
      const avgDuration = zonePoints.length > 0 ? totalDuration / zonePoints.length : 0
      const activities = zonePoints.reduce((acc, p) => {
        acc[p.activity] = (acc[p.activity] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        ...zone,
        totalVisits: zonePoints.length,
        totalDuration,
        avgDuration,
        activities,
        intensity: Math.min(zonePoints.length * 5, 100)
      }
    })

    return zoneData.sort((a, b) => b.totalVisits - a.totalVisits)
  }, [filteredData, zones])

  // Detect anomalies
  const anomalies = useMemo(() => {
    const detected = []
    
    // Long idle periods
    const longIdles = filteredData.filter(p => 
      p.activity === 'idle' && p.duration > 30
    )
    
    if (longIdles.length > 0) {
      detected.push({
        type: 'long_idle',
        message: `${longIdles.length} períodos de inatividade prolongada detectados`,
        severity: 'warning' as const,
        data: longIdles
      })
    }

    // Unusual zone patterns
    const unusualZones = zoneActivity.filter(z => 
      z.type === 'work' && z.totalVisits === 0
    )

    if (unusualZones.length > 0) {
      detected.push({
        type: 'unused_zones',
        message: `${unusualZones.length} zonas de trabalho não utilizadas`,
        severity: 'info' as const,
        data: unusualZones
      })
    }

    // Off-hours activity
    const offHours = filteredData.filter(p => {
      const hour = p.timestamp.getHours()
      return hour < 6 || hour > 22
    })

    if (offHours.length > 0) {
      detected.push({
        type: 'off_hours',
        message: `${offHours.length} atividades fora do horário comercial`,
        severity: 'warning' as const,
        data: offHours
      })
    }

    return detected
  }, [filteredData, zoneActivity])

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100 dark:bg-gray-800'
    if (intensity <= 20) return 'bg-blue-100 dark:bg-blue-900/30'
    if (intensity <= 40) return 'bg-blue-200 dark:bg-blue-800/50'
    if (intensity <= 60) return 'bg-blue-400 dark:bg-blue-700/70'
    if (intensity <= 80) return 'bg-blue-500 dark:bg-blue-600/80'
    return 'bg-blue-600 dark:bg-blue-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Mapa de Presença
          </h2>
          {employeeName && (
            <p className="text-gray-600 dark:text-gray-400">{employeeName}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={viewMode} onValueChange={(value: 'hourly' | 'zones' | 'patterns') => setViewMode(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Por Horário</SelectItem>
              <SelectItem value="zones">Por Zona</SelectItem>
              <SelectItem value="patterns">Padrões</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedZone} onValueChange={setSelectedZone}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Zona" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Zonas</SelectItem>
              {zones.map(zone => (
                <SelectItem key={zone.id} value={zone.id}>
                  {zone.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedActivity} onValueChange={setSelectedActivity}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Atividade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {Object.entries(activityLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Anomalies Alert */}
      {anomalies.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-orange-800 dark:text-orange-200">
                  Anomalias Detectadas
                </h3>
                <div className="mt-2 space-y-1">
                  {anomalies.map((anomaly, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge 
                        variant={anomaly.severity === 'warning' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {anomaly.severity === 'warning' ? 'Atenção' : 'Info'}
                      </Badge>
                      <span className="text-sm text-orange-700 dark:text-orange-300">
                        {anomaly.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'hourly' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Heatmap por Horário da Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Hour labels */}
              <div className="grid grid-cols-25 gap-1 text-xs">
                <div></div>
                {hours.map(hour => (
                  <div key={hour} className="text-center">
                    {hour}h
                  </div>
                ))}
              </div>

              {/* Heatmap grid */}
              {hourlyHeatmap.map((dayData, dayIndex) => (
                <div key={dayIndex} className="grid grid-cols-25 gap-1">
                  <div className="text-sm font-medium py-2 text-right pr-2">
                    {weekDays[dayIndex]}
                  </div>
                  {dayData.map((hourData, hourIndex) => (
                    <div
                      key={`${dayIndex}-${hourIndex}`}
                      className={cn(
                        "h-8 rounded-sm border border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:scale-110 hover:z-10",
                        getIntensityColor(hourData.intensity)
                      )}
                      title={`${weekDays[dayIndex]} ${hourIndex}:00 - Intensidade: ${hourData.intensity}% - Atividades: ${hourData.activities.join(', ') || 'Nenhuma'}`}
                    />
                  ))}
                </div>
              ))}

              {/* Legend */}
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Menos ativo</span>
                <div className="flex gap-1">
                  {[0, 20, 40, 60, 80, 100].map(intensity => (
                    <div
                      key={intensity}
                      className={cn("w-4 h-4 rounded-sm", getIntensityColor(intensity))}
                    />
                  ))}
                </div>
                <span>Mais ativo</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'zones' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {zoneActivity.map(zone => (
            <Card key={zone.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: zone.color }}
                    />
                    {zone.name}
                  </div>
                  <Badge variant="secondary">
                    {zone.totalVisits} visitas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tempo total:
                    </span>
                    <span className="font-medium">
                      {Math.round(zone.totalDuration / 60)}h {zone.totalDuration % 60}min
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tempo médio:
                    </span>
                    <span className="font-medium">
                      {Math.round(zone.avgDuration)}min
                    </span>
                  </div>

                  {/* Activity breakdown */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Atividades:</h4>
                    <div className="space-y-2">
                      {Object.entries(zone.activities).map(([activity, count]) => (
                        <div key={activity} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-3 h-3 rounded-full", activityColors[activity as keyof typeof activityColors])} />
                            <span className="text-sm">
                              {activityLabels[activity as keyof typeof activityLabels]}
                            </span>
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Intensity bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Intensidade:</span>
                      <span className="font-medium">{zone.intensity}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${zone.intensity}%`,
                          backgroundColor: zone.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewMode === 'patterns' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Peak Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Horários de Pico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, index) => {
                  const hour = 9 + index * 2 // Mock peak hours
                  const activity = Math.random() * 100
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{hour}:00 - {hour + 1}:00</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${activity}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12">
                          {Math.round(activity)}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Break Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Padrões de Intervalo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Intervalos Comuns:</h4>
                  <div className="space-y-2">
                    {['10:00 - 10:15', '12:00 - 13:00', '15:30 - 15:45'].map((time, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{time}</span>
                        <Badge variant="secondary" className="text-xs">
                          {Math.floor(Math.random() * 20 + 80)}% frequência
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Duração Média:</h4>
                  <div className="text-2xl font-bold text-green-500">
                    {Math.floor(Math.random() * 10 + 15)} min
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}