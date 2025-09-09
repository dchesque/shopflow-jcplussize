'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Camera, 
  Upload, 
  X, 
  RotateCcw, 
  Check,
  Video,
  VideoOff,
  User
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface PhotoUploadProps {
  onPhotoSelected: (file: File) => void
  currentPhotoUrl?: string
  employeeName?: string
  className?: string
}

type CaptureMode = 'upload' | 'camera'

export function PhotoUpload({ 
  onPhotoSelected, 
  currentPhotoUrl, 
  employeeName = '',
  className 
}: PhotoUploadProps) {
  const [mode, setMode] = useState<CaptureMode>('upload')
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      })
      
      setStream(mediaStream)
      setIsCameraActive(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error)
      alert('Não foi possível acessar a câmera. Verifique as permissões do navegador.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCameraActive(false)
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0)

    // Convert to blob and create file
    canvas.toBlob((blob) => {
      if (!blob) return

      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      setCapturedPhoto(dataUrl)

      // Create file from blob
      const file = new File([blob], `${employeeName || 'employee'}_photo.jpg`, {
        type: 'image/jpeg'
      })

      onPhotoSelected(file)
      stopCamera()
    }, 'image/jpeg', 0.8)
  }, [employeeName, onPhotoSelected, stopCamera])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido.')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('A imagem deve ter no máximo 5MB.')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setCapturedPhoto(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    onPhotoSelected(file)
  }

  const resetPhoto = () => {
    setCapturedPhoto(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Mode Selection */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === 'upload' ? 'primary' : 'outline'}
          onClick={() => {
            setMode('upload')
            if (isCameraActive) stopCamera()
          }}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload de Arquivo
        </Button>
        <Button
          type="button"
          variant={mode === 'camera' ? 'primary' : 'outline'}
          onClick={() => setMode('camera')}
          className="flex-1"
        >
          <Camera className="h-4 w-4 mr-2" />
          Usar Câmera
        </Button>
      </div>

      {/* Photo Preview Area */}
      <Card className="relative">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            
            {/* Current Photo Display */}
            {(capturedPhoto || currentPhotoUrl) && (
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage 
                    src={capturedPhoto || currentPhotoUrl} 
                    alt={employeeName}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl">
                    {employeeName ? getInitials(employeeName) : <User className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={resetPhoto}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Upload Mode */}
            {mode === 'upload' && !capturedPhoto && (
              <div className="w-full">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Clique aqui para selecionar uma foto
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG até 5MB
                  </p>
                </div>
              </div>
            )}

            {/* Camera Mode */}
            {mode === 'camera' && (
              <div className="w-full space-y-4">
                <AnimatePresence>
                  {isCameraActive ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative"
                    >
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full max-w-sm mx-auto rounded-lg border-2 border-gray-300"
                      />
                      
                      <div className="flex gap-2 justify-center mt-4">
                        <Button
                          type="button"
                          onClick={capturePhoto}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Capturar Foto
                        </Button>
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={stopCamera}
                        >
                          <VideoOff className="h-4 w-4 mr-2" />
                          Parar Câmera
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center"
                    >
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                        <Video className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-4">
                          Use a câmera para tirar uma foto do funcionário
                        </p>
                        
                        <Button
                          type="button"
                          onClick={startCamera}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Ativar Câmera
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Photo Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          Diretrizes para a Foto
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use uma foto frontal, bem iluminada</li>
          <li>• Evite usar óculos escuros ou chapéus</li>
          <li>• Mantenha expressão neutra</li>
          <li>• Fundo claro e uniforme é preferível</li>
          <li>• A foto será usada para reconhecimento facial</li>
        </ul>
      </div>
    </div>
  )
}