'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

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

interface CameraDetectionData {
  cameraId: string
  detections: Detection[]
  timestamp: string
  peopleCount: number
}

interface DetectionContextType {
  cameraDetections: Map<string, CameraDetectionData>
  updateDetections: (cameraId: string, detections: Detection[]) => void
  getPeopleCount: (cameraId: string) => number
  getTotalPeople: () => number
  getCustomersCount: () => number
  getEmployeesCount: () => number
}

const DetectionContext = createContext<DetectionContextType | undefined>(undefined)

export function DetectionProvider({ children }: { children: React.ReactNode }) {
  const [cameraDetections, setCameraDetections] = useState<Map<string, CameraDetectionData>>(new Map())

  const updateDetections = useCallback((cameraId: string, detections: Detection[]) => {
    setCameraDetections(prevMap => {
      const newMap = new Map(prevMap)
      newMap.set(cameraId, {
        cameraId,
        detections,
        timestamp: new Date().toISOString(),
        peopleCount: detections.filter(d => d.class === 'person').length
      })
      return newMap
    })
  }, [])

  const getPeopleCount = useCallback((cameraId: string): number => {
    const data = cameraDetections.get(cameraId)
    return data?.peopleCount || 0
  }, [cameraDetections])

  const getTotalPeople = useCallback((): number => {
    let total = 0
    for (const data of cameraDetections.values()) {
      total += data.peopleCount
    }
    return total
  }, [cameraDetections])

  // Para demo, vamos assumir que a primeira pessoa é cliente, depois funcionários
  const getCustomersCount = useCallback((): number => {
    const total = getTotalPeople()
    return total > 0 ? 1 : 0  // Primeira pessoa é sempre cliente
  }, [getTotalPeople])

  const getEmployeesCount = useCallback((): number => {
    const total = getTotalPeople()
    return total > 1 ? total - 1 : 0  // Demais são funcionários
  }, [getTotalPeople])

  const value: DetectionContextType = {
    cameraDetections,
    updateDetections,
    getPeopleCount,
    getTotalPeople,
    getCustomersCount,
    getEmployeesCount
  }

  return (
    <DetectionContext.Provider value={value}>
      {children}
    </DetectionContext.Provider>
  )
}

export function useDetection() {
  const context = useContext(DetectionContext)
  if (context === undefined) {
    throw new Error('useDetection must be used within a DetectionProvider')
  }
  return context
}