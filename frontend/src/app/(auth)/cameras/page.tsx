'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Camera, 
  Settings, 
  Download, 
  RotateCcw,
  Maximize2,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  AlertTriangle
} from 'lucide-react'
import { CameraGrid } from '@/components/cameras/CameraGrid'
import { useCameras, useCameraHealth } from '@/hooks/useCameras'
import { Button } from '@/components/ui/button'
import { Camera as CameraType } from '@/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useDetection } from '@/contexts/DetectionContext'


export default function CamerasPage() {
  const { cameras, isLoading, refetch, captureSnapshot, processFrame } = useCameras()
  const { health, isHealthy } = useCameraHealth()
  const { getTotalPeople, getCustomersCount, getEmployeesCount } = useDetection()
  const [selectedCamera, setSelectedCamera] = useState<CameraType | null>(null)
  const [showDetections, setShowDetections] = useState(true)
  const [fullscreenCamera, setFullscreenCamera] = useState<string | null>(null)

  const onlineCameras = cameras.filter(cam => cam.status === 'online')
  const offlineCameras = cameras.filter(cam => cam.status === 'offline')

  const handleCameraSelect = (camera: CameraType) => {
    if (camera) {
      setSelectedCamera(camera)
      toast.info(`Câmera selecionada: ${camera.name}`)
    }
  }

  const handleSnapshot = async (cameraId: string) => {
    try {
      const camera = cameras.find(cam => cam.id === cameraId)
      if (!camera) return

      toast.loading('Capturando snapshot...', { id: 'snapshot' })
      
      const snapshot = await captureSnapshot(cameraId)
      
      // Simular download do snapshot
      const link = document.createElement('a')
      link.href = snapshot
      link.download = `snapshot-${camera.name}-${new Date().toISOString().slice(0, 19)}.jpg`
      link.click()
      
      toast.success(`Snapshot capturado: ${camera.name}`, { id: 'snapshot' })
    } catch (error) {
      toast.error('Erro ao capturar snapshot', { id: 'snapshot' })
    }
  }

  const handleFullscreen = (cameraId: string) => {
    setFullscreenCamera(cameraId)
    toast.info('Modo fullscreen ativado - Pressione ESC para sair')
  }

  const handleSettings = (cameraId: string) => {
    const camera = cameras.find(cam => cam.id === cameraId)
    if (camera) {
      toast.info(`Configurações: ${camera.name}`)
      // Em produção, abriria modal de configurações
    }
  }

  const toggleDetections = () => {
    setShowDetections(!showDetections)
    toast.success(`Detecções ${!showDetections ? 'ativadas' : 'desativadas'}`)
  }

  const handleRefreshAll = () => {
    refetch()
    toast.success('Câmeras atualizadas')
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Câmeras</h1>
            <p className="text-neutral-400 mt-1">Carregando sistema de câmeras...</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-video bg-neutral-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Câmeras</h1>
          <p className="text-neutral-400 mt-1">
            {onlineCameras.length} online • {offlineCameras.length} offline
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Health Status */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
            isHealthy 
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          )}>
            {isHealthy ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            Sistema {isHealthy ? 'Saudável' : 'Com Problemas'}
          </div>

          {/* Controls */}
          <Button
            variant="ghost"
            size="md"
            onClick={toggleDetections}
            className={showDetections ? 'text-green-400' : 'text-neutral-400'}
          >
            {showDetections ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Detecções
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={handleRefreshAll}
          >
            <RotateCcw className="w-4 h-4" />
            Atualizar
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => toast.info('Configurações em desenvolvimento')}
          >
            <Settings className="w-4 h-4" />
            Configurações
          </Button>
        </div>
      </div>

      {/* System Health Alert */}
      {!isHealthy && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-yellow-400 font-semibold">
                Sistema de Análise com Problemas
              </h3>
              <p className="text-yellow-300/80 text-sm mt-1">
                Alguns módulos de IA podem estar indisponíveis. Verifique a conexão com o backend.
              </p>
              <div className="mt-2 text-xs text-yellow-300/60">
                Status dos módulos: Detector: {health?.detector_loaded ? '✓' : '✗'} • 
                Analytics: {health?.analytics_initialized ? '✓' : '✗'}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Selected Camera Info */}
      {selectedCamera && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Camera className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-blue-400 font-semibold">
                  {selectedCamera.name}
                </h3>
                <p className="text-blue-300/80 text-sm">
                  {selectedCamera.location} • {selectedCamera.peopleCount} pessoas detectadas
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSnapshot(selectedCamera.id)}
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              >
                <Download className="w-4 h-4" />
                Snapshot
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFullscreen(selectedCamera.id)}
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              >
                <Maximize2 className="w-4 h-4" />
                Expandir
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Camera Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {cameras.length > 0 ? (
          <CameraGrid
            cameras={cameras}
            onCameraSelect={handleCameraSelect}
            onSnapshot={handleSnapshot}
            onFullscreen={handleFullscreen}
            onSettings={handleSettings}
          />
        ) : (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhuma câmera encontrada
            </h3>
            <p className="text-neutral-400 mb-6 max-w-md mx-auto">
              Configure suas câmeras para começar a monitorar o fluxo de pessoas em tempo real.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => toast.info('Configuração de câmeras em desenvolvimento')}
            >
              <Settings className="w-5 h-5 mr-2" />
              Configurar Câmeras
            </Button>
          </div>
        )}
      </motion.div>

      {/* Statistics Summary */}
      {cameras.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-400 text-sm">Total Pessoas</span>
              <Wifi className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {getTotalPeople()}
            </p>
          </div>

          <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-400 text-sm">Clientes</span>
              <Wifi className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">
              {getCustomersCount()}
            </p>
          </div>

          <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-400 text-sm">Funcionários</span>
              <Wifi className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-purple-400">
              {getEmployeesCount()}
            </p>
          </div>

          <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-400 text-sm">Câmeras Online</span>
              <Wifi className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">
              {onlineCameras.length}/{cameras.length}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}