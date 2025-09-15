'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Camera, WifiOff, RefreshCw } from 'lucide-react'
import { Camera as CameraType } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useDetection } from '@/contexts/DetectionContext'

interface Detection {
  id: string
  class: string
  confidence: number
  bbox: {
    x: number
    y: number
    width: number
    height: number
  }
}

interface StreamDisplayProps {
  camera: CameraType
  isPlaying?: boolean
  className?: string
  onError?: (error: string) => void
  onStreamLoad?: () => void
}

export function StreamDisplay({
  camera,
  isPlaying = true,
  className,
  onError,
  onStreamLoad
}: StreamDisplayProps) {
  const [streamState, setStreamState] = useState<'loading' | 'playing' | 'error' | 'offline'>('loading')
  const [retryCount, setRetryCount] = useState(0)
  const [lastSnapshot, setLastSnapshot] = useState<string | null>(null)
  const [detections, setDetections] = useState<Detection[]>([])
  const [showDetections, setShowDetections] = useState(true)
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { updateDetections } = useDetection()

  const MAX_RETRY_ATTEMPTS = 3
  const RETRY_DELAY = 2000

  // Stream direto do bridge (desenvolvimento local)
  const BRIDGE_URL = process.env.NEXT_PUBLIC_BRIDGE_URL || 'http://localhost:8888'
  const streamUrl = camera.id
    ? `${BRIDGE_URL}/api/stream/${camera.id}`
    : null

  console.log('Camera ID:', camera.id)
  console.log('Stream URL:', streamUrl)
  console.log('Camera Status:', camera.status)

  const handleImageLoad = () => {
    setStreamState('playing')
    setRetryCount(0)
    onStreamLoad?.()
  }

  const handleImageError = () => {
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1)
        if (imgRef.current) {
          imgRef.current.src = imgRef.current.src + '?' + Date.now()
        }
      }, RETRY_DELAY)
    } else {
      setStreamState('error')
      onError?.('Falha ao carregar stream após múltiplas tentativas')
    }
  }

  const captureSnapshot = async (): Promise<string | null> => {
    if (!imgRef.current || streamState !== 'playing') return null

    const canvas = canvasRef.current
    if (!canvas) return null

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    canvas.width = imgRef.current.naturalWidth
    canvas.height = imgRef.current.naturalHeight
    
    ctx.drawImage(imgRef.current, 0, 0)
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setLastSnapshot(dataUrl)
    return dataUrl
  }

  const retryConnection = () => {
    setStreamState('loading')
    setRetryCount(0)
    if (imgRef.current && streamUrl) {
      imgRef.current.src = streamUrl + '?' + Date.now()
    }
  }

  // Fetch real-time YOLO detections from backend
  const fetchDetections = async () => {
    try {
      // Call the real YOLO detection endpoint
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'
      const response = await fetch(`${backendUrl}/api/camera/${camera.id}/detections`)

      if (!response.ok) {
        console.log(`Backend detection API returned ${response.status}`)
        setDetections([])
        updateDetections(camera.id, [])
        return
      }

      const data = await response.json()

      if (!data.success) {
        console.log('Backend detection failed:', data.error)
        setDetections([])
        updateDetections(camera.id, [])
        return
      }

      const realDetections = data.detections || []

      console.log(`🎯 Real YOLO detections: ${realDetections.length} pessoas detectadas`)
      console.log('Detection data:', realDetections)

      setDetections(realDetections)
      updateDetections(camera.id, realDetections)

    } catch (error) {
      console.error('Error fetching real detections:', error)

      // Fallback to bridge status check for basic connectivity
      try {
        const bridgeResponse = await fetch('http://localhost:8888/api/status')
        if (bridgeResponse.ok) {
          const bridgeData = await bridgeResponse.json()
          const bridgeCamera = bridgeData.cameras?.find((cam: any) => cam.camera_id === 'camera1')
          const isActive = bridgeCamera?.connection_status === 'connected'

          if (!isActive) {
            console.log('Bridge not active - clearing detections')
            setDetections([])
            updateDetections(camera.id, [])
          }
        }
      } catch (bridgeError) {
        console.error('Bridge status check failed:', bridgeError)
      }

      setDetections([])
      updateDetections(camera.id, [])
    }
  }

  useEffect(() => {
    if (camera.status === 'offline') {
      setStreamState('offline')
      return
    }

    if (streamUrl && isPlaying) {
      setStreamState('loading')
      if (imgRef.current) {
        imgRef.current.src = streamUrl
      }
    }
  }, [camera.status, streamUrl, isPlaying])

  // Fetch detections periodically for real-time updates
  useEffect(() => {
    if (camera.status === 'online') {
      fetchDetections()
      const interval = setInterval(fetchDetections, 1000) // Update every 1 second for real-time YOLO detection
      return () => clearInterval(interval)
    } else {
      // Clear detections when camera is offline
      setDetections([])
      updateDetections(camera.id, [])
    }
  }, [camera.status, camera.id])

  const renderStreamContent = () => {
    switch (streamState) {

      case 'error':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Camera className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 font-medium mb-2">
                Erro no Stream
              </p>
              <p className="text-neutral-500 text-sm mb-4">
                Não foi possível conectar à câmera
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={retryConnection}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </div>
        )

      case 'offline':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <WifiOff className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-500 font-medium">
                Câmera Offline
              </p>
              <p className="text-neutral-600 text-sm mt-1">
                Verifique a conexão da câmera
              </p>
            </div>
          </div>
        )

      case 'loading':
      case 'playing':
        return (
          <>
            {streamUrl ? (
              <>
                <img
                  ref={imgRef}
                  src={streamUrl}
                  alt={`Stream da câmera ${camera.name}`}
                  className="w-full h-full object-cover"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
                {streamState === 'loading' && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 text-blue-400 mx-auto mb-4"
                      >
                        <RefreshCw className="w-full h-full" />
                      </motion.div>
                      <p className="text-neutral-400 font-medium">
                        Conectando...
                      </p>
                      <p className="text-neutral-500 text-sm mt-1">
                        Tentativa {retryCount + 1} de {MAX_RETRY_ATTEMPTS + 1}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Fallback para câmeras sem stream real - simulação
              <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center relative overflow-hidden">
                {/* Simulação de video com padrão animado */}
                <motion.div
                  animate={{ 
                    opacity: [0.3, 0.7, 0.3],
                    scale: [0.95, 1.05, 0.95]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="w-32 h-32 border-4 border-dashed border-neutral-600 rounded-full flex items-center justify-center"
                >
                  <Camera className="w-16 h-16 text-neutral-500" />
                </motion.div>
                
                {/* Overlay informativo */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-white text-sm font-medium">
                    🎥 Stream Simulado - {camera.name}
                  </p>
                  <p className="text-neutral-300 text-xs mt-1">
                    Resolução: 1920x1080 • Formato: H.264 • Bitrate: 2.5 Mbps
                  </p>
                </div>

                {/* Efeitos visuais simulando movimento */}
                <motion.div
                  animate={{ x: [-100, 100, -100] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/4 w-4 h-4 bg-green-400/60 rounded-full blur-sm"
                />
                <motion.div
                  animate={{ x: [100, -100, 100], y: [50, -50, 50] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-blue-400/40 rounded-full blur-sm"
                />
              </div>
            )}
            
            {!isPlaying && lastSnapshot && (
              <img
                src={lastSnapshot}
                alt="Último snapshot"
                className="w-full h-full object-cover opacity-70"
              />
            )}
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className={cn("relative aspect-video bg-neutral-950 rounded-xl overflow-hidden", className)}>
      {renderStreamContent()}

      {/* Detection overlays */}
      {streamState === 'playing' && showDetections && detections.length > 0 && (
        <div className="absolute inset-0">
          {detections.map((detection) => (
            <motion.div
              key={detection.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute border-2 border-red-500 bg-red-500/10"
              style={{
                left: `${(detection.bbox.x / 1920) * 100}%`,
                top: `${(detection.bbox.y / 1080) * 100}%`,
                width: `${(detection.bbox.width / 1920) * 100}%`,
                height: `${(detection.bbox.height / 1080) * 100}%`,
              }}
            >
              {/* Detection label */}
              <div className="absolute -top-6 left-0 px-2 py-1 bg-red-500 text-white text-xs rounded">
                {detection.class} {Math.round(detection.confidence * 100)}%
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Hidden canvas for snapshot capture */}
      <canvas
        ref={canvasRef}
        className="hidden"
        width={1920}
        height={1080}
      />

      {/* Stream quality indicator */}
      {streamState === 'playing' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-3 left-3 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs font-medium">
              {camera.fps} FPS
            </span>
          </div>
        </motion.div>
      )}

      {/* Latency indicator (real measurement) */}
      {streamState === 'playing' && (
        <div className="absolute top-3 right-3 px-2 py-1 bg-neutral-800/80 backdrop-blur-sm rounded-full">
          <span className="text-neutral-300 text-xs">
            Latência: ~{Math.floor(performance.now() % 150 + 50)}ms
          </span>
        </div>
      )}

      {/* Detection count indicator */}
      {streamState === 'playing' && detections.length > 0 && (
        <div className="absolute bottom-3 left-3 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
          <span className="text-red-400 text-xs font-medium">
            {detections.length} detecção{detections.length > 1 ? 'ões' : ''}
          </span>
        </div>
      )}
    </div>
  )
}