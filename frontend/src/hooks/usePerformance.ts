'use client'

import { useCallback, useRef, useEffect, useState } from 'react'

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Throttle hook
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttleRef = useRef<NodeJS.Timeout | null>(null)
  const lastCallRef = useRef<number>(0)

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      
      if (now - lastCallRef.current >= delay) {
        callback(...args)
        lastCallRef.current = now
      } else if (!throttleRef.current) {
        throttleRef.current = setTimeout(() => {
          callback(...args)
          lastCallRef.current = Date.now()
          throttleRef.current = null
        }, delay - (now - lastCallRef.current))
      }
    },
    [callback, delay]
  ) as T

  useEffect(() => {
    return () => {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current)
      }
    }
  }, [])

  return throttledCallback
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)

  const { threshold = 0, rootMargin = '0px', root = null } = options

  useEffect(() => {
    const element = elementRef.current
    if (!element || !('IntersectionObserver' in window)) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        setEntry(entry)
      },
      { threshold, rootMargin, root }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, root])

  return { ref: elementRef, isIntersecting, entry }
}

// Memory usage hook
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize?: number
    totalJSHeapSize?: number
    jsHeapSizeLimit?: number
  } | null>(null)

  useEffect(() => {
    const updateMemoryInfo = () => {
      // @ts-ignore - performance.memory is not in all browsers
      if (window.performance && window.performance.memory) {
        // @ts-ignore
        const memory = window.performance.memory
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        })
      }
    }

    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return memoryInfo
}

// FPS monitor hook
export function useFPSMonitor() {
  const [fps, setFps] = useState<number>(0)
  const frameCountRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const rafIdRef = useRef<number>()

  useEffect(() => {
    const measureFPS = (currentTime: number) => {
      frameCountRef.current++

      if (currentTime >= lastTimeRef.current + 1000) {
        setFps(frameCountRef.current)
        frameCountRef.current = 0
        lastTimeRef.current = currentTime
      }

      rafIdRef.current = requestAnimationFrame(measureFPS)
    }

    rafIdRef.current = requestAnimationFrame(measureFPS)

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

  return fps
}

// Performance metrics hook
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<{
    navigationTiming?: PerformanceNavigationTiming
    paintMetrics?: { [key: string]: number }
    resourceTimings?: PerformanceResourceTiming[]
    memoryInfo?: { usedJSHeapSize?: number; totalJSHeapSize?: number; jsHeapSizeLimit?: number }
    fps?: number
  }>({})

  const memoryInfo = useMemoryMonitor()
  const fps = useFPSMonitor()

  useEffect(() => {
    const updateMetrics = () => {
      // Navigation timing
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

      // Paint metrics
      const paintMetrics: { [key: string]: number } = {}
      performance.getEntriesByType('paint').forEach((entry) => {
        paintMetrics[entry.name] = entry.startTime
      })

      // Resource timings
      const resourceTimings = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

      setMetrics({
        navigationTiming: navTiming,
        paintMetrics,
        resourceTimings,
        memoryInfo: memoryInfo || undefined,
        fps
      })
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [memoryInfo, fps])

  return metrics
}

// Batch updates hook for reducing re-renders
export function useBatchedUpdates<T>(
  initialState: T,
  batchDelay: number = 100
): [T, (updater: (prevState: T) => T) => void] {
  const [state, setState] = useState<T>(initialState)
  const pendingUpdatesRef = useRef<((prevState: T) => T)[]>([])
  const timeoutRef = useRef<NodeJS.Timeout>()

  const batchedSetState = useCallback((updater: (prevState: T) => T) => {
    pendingUpdatesRef.current.push(updater)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setState(prevState => {
        let newState = prevState
        pendingUpdatesRef.current.forEach(update => {
          newState = update(newState)
        })
        pendingUpdatesRef.current = []
        return newState
      })
    }, batchDelay)
  }, [batchDelay])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [state, batchedSetState]
}

// Cleanup hook for managing resources
export function useCleanup() {
  const cleanupFunctionsRef = useRef<(() => void)[]>([])

  const addCleanup = useCallback((cleanupFn: () => void) => {
    cleanupFunctionsRef.current.push(cleanupFn)
  }, [])

  const cleanup = useCallback(() => {
    cleanupFunctionsRef.current.forEach(fn => {
      try {
        fn()
      } catch (error) {
        console.error('Cleanup error:', error)
      }
    })
    cleanupFunctionsRef.current = []
  }, [])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  return { addCleanup, cleanup }
}

// Virtual scrolling hook
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 3
) {
  const [scrollTop, setScrollTop] = useState(0)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
    item,
    index: startIndex + index,
    top: (startIndex + index) * itemHeight
  }))

  const totalHeight = items.length * itemHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    startIndex,
    endIndex,
    handleScroll
  }
}

// Resource preloading hook
export function usePreload() {
  const preloadedResourcesRef = useRef<Set<string>>(new Set())

  const preloadImage = useCallback((src: string): Promise<void> => {
    if (preloadedResourcesRef.current.has(src)) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        preloadedResourcesRef.current.add(src)
        resolve()
      }
      img.onerror = reject
      img.src = src
    })
  }, [])

  const preloadScript = useCallback((src: string): Promise<void> => {
    if (preloadedResourcesRef.current.has(src)) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.onload = () => {
        preloadedResourcesRef.current.add(src)
        resolve()
      }
      script.onerror = reject
      script.src = src
      document.head.appendChild(script)
    })
  }, [])

  return { preloadImage, preloadScript }
}

// Device capabilities hook
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    isOnline: navigator.onLine,
    deviceMemory: (navigator as any).deviceMemory || null,
    hardwareConcurrency: navigator.hardwareConcurrency,
    connection: (navigator as any).connection || null,
    isLowEndDevice: false
  })

  useEffect(() => {
    // Detect low-end devices
    const isLowEnd = capabilities.hardwareConcurrency <= 2 || 
                     (capabilities.deviceMemory && capabilities.deviceMemory <= 2)

    setCapabilities(prev => ({ ...prev, isLowEndDevice: isLowEnd }))

    const handleOnline = () => setCapabilities(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setCapabilities(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [capabilities.hardwareConcurrency, capabilities.deviceMemory])

  return capabilities
}