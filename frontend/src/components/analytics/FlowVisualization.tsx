'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Play, Pause, RotateCcw, TrendingUp, Users, MapPin } from 'lucide-react'

interface FlowPoint {
  x: number
  y: number
  timestamp: Date
  zone: string
  dwellTime: number
  activity: 'walking' | 'browsing' | 'shopping' | 'waiting'
}

interface CustomerPath {
  id: string
  customerId: string
  path: FlowPoint[]
  totalTime: number
  conversion: boolean
  customerType: 'new' | 'returning' | 'vip'
}

interface HeatmapZone {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  intensity: number
  avgDwellTime: number
  totalVisits: number
}

interface FlowVisualizationProps {
  className?: string
  timeRange?: '1h' | '6h' | '24h' | '7d'
  onTimeRangeChange?: (range: '1h' | '6h' | '24h' | '7d') => void
}

export function FlowVisualization({ 
  className = '', 
  timeRange = '1h',
  onTimeRangeChange 
}: FlowVisualizationProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'paths' | 'heatmap' | 'patterns'>('paths')
  
  const generateMockPaths = (): CustomerPath[] => {
    const paths: CustomerPath[] = []
    const zones = ['entrance', 'electronics', 'clothing', 'food', 'checkout', 'exit']
    
    for (let i = 0; i < 15; i++) {
      const points: FlowPoint[] = []
      const pathLength = Math.floor(Math.random() * 8) + 3
      let currentZoneIndex = 0
      
      for (let j = 0; j < pathLength; j++) {
        const zone = zones[currentZoneIndex % zones.length]
        points.push({
          x: Math.random() * 400 + 50,
          y: Math.random() * 300 + 50,
          timestamp: new Date(Date.now() - (pathLength - j) * 60000),
          zone,
          dwellTime: Math.random() * 120 + 30,
          activity: ['walking', 'browsing', 'shopping', 'waiting'][Math.floor(Math.random() * 4)] as any
        })
        if (Math.random() > 0.3) currentZoneIndex++
      }
      
      paths.push({
        id: `path_${i}`,
        customerId: `customer_${i}`,
        path: points,
        totalTime: points.reduce((sum, p) => sum + p.dwellTime, 0),
        conversion: Math.random() > 0.6,
        customerType: ['new', 'returning', 'vip'][Math.floor(Math.random() * 3)] as any
      })
    }
    
    return paths
  }
  
  const generateMockHeatmap = (): HeatmapZone[] => {
    const zones = [
      { name: 'Entrada', x: 50, y: 50, width: 80, height: 60 },
      { name: 'Eletrônicos', x: 200, y: 80, width: 120, height: 100 },
      { name: 'Roupas', x: 100, y: 200, width: 150, height: 120 },
      { name: 'Alimentação', x: 300, y: 200, width: 100, height: 80 },
      { name: 'Checkout', x: 350, y: 300, width: 80, height: 60 },
      { name: 'Saída', x: 450, y: 350, width: 60, height: 50 }
    ]
    
    return zones.map((zone, index) => ({
      id: `zone_${index}`,
      ...zone,
      intensity: Math.random() * 0.8 + 0.2,
      avgDwellTime: Math.random() * 180 + 60,
      totalVisits: Math.floor(Math.random() * 150) + 50
    }))
  }
  
  const [customerPaths] = useState(generateMockPaths())
  const [heatmapZones] = useState(generateMockHeatmap())
  
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => (prev + 1) % 100)
      }, 100)
      return () => clearInterval(interval)
    }
  }, [isPlaying])
  
  const getPathColor = (customerType: string, conversion: boolean) => {
    if (conversion) {
      return customerType === 'vip' ? '#10b981' : customerType === 'returning' ? '#3b82f6' : '#06b6d4'
    }
    return customerType === 'vip' ? '#f59e0b' : customerType === 'returning' ? '#8b5cf6' : '#6b7280'
  }
  
  const getHeatmapColor = (intensity: number) => {
    const opacity = intensity
    return `rgba(239, 68, 68, ${opacity})`
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Visualização de Fluxo</h3>
            <p className="text-sm text-muted-foreground">
              Análise de padrões de movimento e zonas de interesse
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paths">Caminhos</SelectItem>
                <SelectItem value="heatmap">Mapa de Calor</SelectItem>
                <SelectItem value="patterns">Padrões</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={timeRange} onValueChange={(value: any) => onTimeRangeChange?.(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 hora</SelectItem>
                <SelectItem value="6h">6 horas</SelectItem>
                <SelectItem value="24h">24 horas</SelectItem>
                <SelectItem value="7d">7 dias</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <Button
                variant={isPlaying ? 'danger' : 'primary'}
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentTime(0)
                  setIsPlaying(false)
                }}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Taxa Conversão</p>
              <p className="text-xl font-semibold">68.2%</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Users className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Visitantes Únicos</p>
              <p className="text-xl font-semibold">247</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <MapPin className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium">Tempo Médio</p>
              <p className="text-xl font-semibold">12.4min</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm font-medium">Zona Popular</p>
              <p className="text-xl font-semibold">Eletrônicos</p>
            </div>
          </div>
        </div>
        
        {/* Main Visualization */}
        <div className="relative w-full h-[500px] bg-muted/30 rounded-lg overflow-hidden">
          <svg width="100%" height="100%" viewBox="0 0 500 400" className="absolute inset-0">
            {/* Store Layout Background */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Heatmap Zones */}
            {viewMode === 'heatmap' && heatmapZones.map((zone) => (
              <g key={zone.id}>
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.width}
                  height={zone.height}
                  fill={getHeatmapColor(zone.intensity)}
                  stroke="#dc2626"
                  strokeWidth="2"
                  rx="8"
                />
                <text
                  x={zone.x + zone.width / 2}
                  y={zone.y + zone.height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-white text-sm font-medium"
                  style={{ fontSize: '12px' }}
                >
                  {zone.name}
                </text>
                <text
                  x={zone.x + zone.width / 2}
                  y={zone.y + zone.height / 2 + 15}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-white text-xs"
                  style={{ fontSize: '10px' }}
                >
                  {zone.totalVisits} visitas
                </text>
              </g>
            ))}
            
            {/* Customer Paths */}
            {viewMode === 'paths' && customerPaths.slice(0, isPlaying ? Math.floor(currentTime / 10) + 1 : customerPaths.length).map((customerPath) => (
              <g key={customerPath.id}>
                <motion.path
                  d={`M ${customerPath.path.map(p => `${p.x},${p.y}`).join(' L ')}`}
                  fill="none"
                  stroke={getPathColor(customerPath.customerType, customerPath.conversion)}
                  strokeWidth="2"
                  strokeDasharray={customerPath.conversion ? "0" : "5,5"}
                  opacity={selectedPath === customerPath.id ? 1 : 0.6}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                
                {/* Path Points */}
                {customerPath.path.map((point, index) => (
                  <motion.circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r={index === 0 ? 6 : index === customerPath.path.length - 1 ? 8 : 4}
                    fill={getPathColor(customerPath.customerType, customerPath.conversion)}
                    stroke="white"
                    strokeWidth="2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="cursor-pointer"
                    onClick={() => setSelectedPath(
                      selectedPath === customerPath.id ? null : customerPath.id
                    )}
                  />
                ))}
              </g>
            ))}
            
            {/* Pattern Detection Areas */}
            {viewMode === 'patterns' && (
              <g>
                <motion.ellipse
                  cx="250"
                  cy="200"
                  rx="80"
                  ry="60"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray="10,5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                />
                <text x="250" y="200" textAnchor="middle" className="fill-green-600 font-medium">
                  Padrão de Compra
                </text>
                
                <motion.ellipse
                  cx="150"
                  cy="120"
                  rx="60"
                  ry="40"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeDasharray="10,5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                />
                <text x="150" y="120" textAnchor="middle" className="fill-orange-600 font-medium">
                  Padrão de Navegação
                </text>
              </g>
            )}
          </svg>
          
          {/* Legend */}
          <div className="absolute top-4 right-4 bg-background/90 p-3 rounded-lg border shadow-sm">
            <h4 className="text-sm font-medium mb-2">Legenda</h4>
            <div className="space-y-2 text-xs">
              {viewMode === 'paths' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-green-500"></div>
                    <span>Conversão (VIP)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-blue-500"></div>
                    <span>Conversão (Retornando)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-gray-500 border-dashed border-t"></div>
                    <span>Sem Conversão</span>
                  </div>
                </>
              )}
              
              {viewMode === 'heatmap' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500"></div>
                    <span>Alta Intensidade</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-300"></div>
                    <span>Média Intensidade</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-100"></div>
                    <span>Baixa Intensidade</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          {isPlaying && (
            <div className="absolute bottom-4 left-4 right-4 bg-background/90 p-2 rounded-lg">
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${currentTime}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Reproduzindo padrões de movimento...
              </p>
            </div>
          )}
        </div>
        
        {/* Selected Path Details */}
        <AnimatePresence>
          {selectedPath && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-muted/50 rounded-lg"
            >
              {(() => {
                const path = customerPaths.find(p => p.id === selectedPath)
                if (!path) return null
                
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Detalhes da Jornada</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={path.conversion ? 'default' : 'secondary'}>
                          {path.conversion ? 'Converteu' : 'Não Converteu'}
                        </Badge>
                        <Badge variant="outline">
                          {path.customerType === 'vip' ? 'VIP' : path.customerType === 'returning' ? 'Retornando' : 'Novo'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tempo Total</p>
                        <p className="font-medium">{Math.round(path.totalTime / 60)} min</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pontos Visitados</p>
                        <p className="font-medium">{path.path.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Zona Final</p>
                        <p className="font-medium">{path.path[path.path.length - 1]?.zone}</p>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}