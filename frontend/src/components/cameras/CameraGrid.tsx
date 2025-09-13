'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Camera, 
  Maximize2, 
  Settings, 
  WifiOff,
  Users,
  UserCheck
} from 'lucide-react'
import { Camera as CameraType, Detection } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { StreamDisplay } from './StreamDisplay'

interface CameraGridProps {
  cameras: CameraType[]
  onCameraSelect?: (camera: CameraType) => void
  onSnapshot?: (cameraId: string) => void
  onFullscreen?: (cameraId: string) => void
  onSettings?: (cameraId: string) => void
}

export function CameraGrid({ 
  cameras, 
  onCameraSelect,
  onSnapshot,
  onFullscreen,
  onSettings 
}: CameraGridProps) {
  const [playingStates, setPlayingStates] = useState<Record<string, boolean>>({})
  const [hoveredCamera, setHoveredCamera] = useState<string | null>(null)

  const togglePlay = (cameraId: string) => {
    setPlayingStates(prev => ({
      ...prev,
      [cameraId]: !prev[cameraId]
    }))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {cameras.map((camera, index) => (
        <motion.div
          key={camera.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="relative group"
          onMouseEnter={() => setHoveredCamera(camera.id)}
          onMouseLeave={() => setHoveredCamera(null)}
          onClick={() => onCameraSelect?.(camera)}
        >
          <div className="relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all duration-300">
            <StreamDisplay 
              camera={camera}
              isPlaying={playingStates[camera.id] !== false}
              onError={(error) => console.error(`Camera ${camera.name}:`, error)}
              onStreamLoad={() => console.log(`Stream loaded for ${camera.name}`)}
            />

            {camera.detections && camera.detections.length > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {camera.detections.map((detection) => (
                  <motion.div
                    key={detection.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute border-2 border-green-500 rounded"
                    style={{
                      left: `${detection.x}%`,
                      top: `${detection.y}%`,
                      width: `${detection.width}%`,
                      height: `${detection.height}%`
                    }}
                  >
                    <div className="absolute -top-8 left-0 px-2 py-1 text-xs bg-green-500 text-white rounded shadow-lg">
                      {detection.label} {Math.round(detection.confidence * 100)}%
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {camera.status === 'offline' && (
              <div className="absolute inset-0 bg-neutral-950 bg-opacity-80 flex items-center justify-center">
                  <div className="text-center">
                    <WifiOff className="w-12 h-12 text-neutral-600 mx-auto mb-2" />
                    <p className="text-neutral-500 font-medium">Câmera Offline</p>
                    <p className="text-neutral-600 text-sm mt-1">
                      Verifique a conexão
                    </p>
                  </div>
                </div>
              )}

            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black from-opacity-70 to-transparent">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {camera.name}
                  </h3>
                  <p className="text-neutral-300 text-sm">
                    {camera.location}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-3 py-1 text-xs rounded-full flex items-center gap-2 font-medium",
                    camera.status === 'online'
                      ? "bg-green-500 bg-opacity-20 text-green-400 border border-green-500 border-opacity-30"
                      : "bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-30"
                  )}>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      camera.status === 'online' ? "bg-green-400" : "bg-red-400"
                    )} />
                    {camera.status === 'online' ? 'Online' : 'Offline'}
                  </span>

                  {camera.status === 'online' && (
                    <span className="px-2 py-1 text-xs rounded-full bg-neutral-800 bg-opacity-80 text-neutral-300">
                      {camera.fps} FPS
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className={cn(
              "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black from-opacity-70 to-transparent transition-opacity duration-300",
              hoveredCamera === camera.id || playingStates[camera.id] ? "opacity-100" : "opacity-0"
            )}>
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-neutral-800 bg-opacity-80 hover:bg-neutral-700 hover:bg-opacity-80 text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    togglePlay(camera.id)
                  }}
                  disabled={camera.status === 'offline'}
                >
                  {playingStates[camera.id] ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-neutral-800 bg-opacity-80 hover:bg-neutral-700 hover:bg-opacity-80 text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSnapshot?.(camera.id)
                  }}
                  disabled={camera.status === 'offline'}
                >
                  <Camera className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-neutral-800 bg-opacity-80 hover:bg-neutral-700 hover:bg-opacity-80 text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    onFullscreen?.(camera.id)
                  }}
                  disabled={camera.status === 'offline'}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-neutral-800 bg-opacity-80 hover:bg-neutral-700 hover:bg-opacity-80 text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSettings?.(camera.id)
                  }}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {camera.status === 'online' && playingStates[camera.id] && (
              <div className="absolute top-4 right-4">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-2 px-3 py-1 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-full"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-red-400 text-xs font-medium">LIVE</span>
                </motion.div>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-neutral-900 bg-opacity-50 rounded-xl px-4 py-3 text-center border border-neutral-800">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-2xl font-bold text-white">
                  {camera.peopleCount || 0}
                </span>
              </div>
              <p className="text-xs text-neutral-400">Total Pessoas</p>
            </div>

            <div className="bg-neutral-900 bg-opacity-50 rounded-xl px-4 py-3 text-center border border-neutral-800">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-2xl font-bold text-green-400">
                  {camera.customersCount || 0}
                </span>
              </div>
              <p className="text-xs text-neutral-400">Clientes</p>
            </div>

            <div className="bg-neutral-900 bg-opacity-50 rounded-xl px-4 py-3 text-center border border-neutral-800">
              <div className="flex items-center justify-center gap-2 mb-1">
                <UserCheck className="w-4 h-4 text-purple-400" />
                <span className="text-2xl font-bold text-purple-400">
                  {camera.employeesCount || 0}
                </span>
              </div>
              <p className="text-xs text-neutral-400">Funcionários</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default CameraGrid